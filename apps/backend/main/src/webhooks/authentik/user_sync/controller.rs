// use std::fs;

use axum::extract::State;
use chrono::{DateTime, Utc};
use error_handlers::handlers::ErrorResponse;
use serde::{Deserialize, Serialize};
use sql::{assets::model::EntityType, shared::traits::PostgresqlRepositoryCreate};
use uuid::Uuid;

use crate::shared::{extractors::json::ValidatedJson, generate_initials_avatar::fetch_png_avatar, traits::ServiceCreateMethod};

#[derive(serde::Deserialize)]
struct StorageBlobResponse {
    id: Uuid,
}

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
pub struct UserData {
    pk: i32,
    uuid: Uuid,
    email: Option<String>,
    username: String,
    is_active: bool,
    created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
pub struct UserDeletedData {
    pk: i32,
}

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
#[serde(tag = "event", content = "payload")]
#[serde(rename_all = "snake_case")]
pub enum UserLifecycleEvents {
    #[serde(rename = "user_created")]
    Created(UserData),
    #[serde(rename = "user_updated")]
    Updated(UserData),
    #[serde(rename = "user_deleted")]
    Deleted(UserDeletedData),
}

#[utoipa::path(
    post,
    path = "/webhooks/authentik/user_sync",
    request_body = UserLifecycleEvents,
    responses(
        (status = 200, description = "User created successfully"),
        (status = 400, description = "Invalid request body", body = error_handlers::handlers::ErrorResponse),
    ),
    tags = ["Webhooks"],
)]
pub async fn user_sync(
    State(state): State<crate::types::app_state::AppState>,
    ValidatedJson(payload): ValidatedJson<UserLifecycleEvents>,
) -> Result<axum::http::StatusCode, ErrorResponse> {
    use crate::entities::user::db as user;

    match payload {
        UserLifecycleEvents::Updated(payload) => {
            match user::UserRepository::update_by_authentik_id(
                &state.postgres,
                payload.pk,
                user::UpdateUserDto {
                    email: Some(payload.email),

                    is_active: Some(payload.is_active),
                    username: Some(payload.username),

                    picture: None,
                    is_avatar_default: None,
                },
            )
            .await
            {
                Ok(_) => {}
                Err(sqlx::Error::RowNotFound) => {
                    tracing::warn!(
                        "UserUpdated received for unknown authentik_id={}, ignoring",
                        payload.pk
                    );
                }
                Err(e) => return Err(ErrorResponse::from(e)),
            }
        }
        UserLifecycleEvents::Created(payload) => {
            let existing = sqlx::query_scalar::<_, bool>(
                "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1 OR authentik_id = $2)",
            )
            .bind(payload.uuid)
            .bind(payload.pk)
            .fetch_one(&state.postgres)
            .await
            .unwrap_or(false);

            if existing {
                tracing::info!(
                    "UserCreated received for existing user authentik_id={}, skipping",
                    payload.pk
                );

                user::UserRepository::update_by_authentik_id(
                    &state.postgres,
                    payload.pk,
                    user::UpdateUserDto {
                        email: Some(payload.email),
                        username: Some(payload.username),
                        is_active: Some(payload.is_active),
                        picture: None,
                        is_avatar_default: None,
                    },
                )
                .await
                .map_err(ErrorResponse::from)?;
            } else {
                let created_user = user::UserRepository::create(
                    &state.postgres,
                    user::CreateUserDto {
                        email: payload.email,
                        username: payload.username,
                        authentik_id: payload.pk,

                        id: Some(payload.uuid),
                        is_active: Some(payload.is_active),
                        created_at: Some(payload.created_at),
                        picture: None,
                    },
                )
                .await
                .map_err(ErrorResponse::from)?;

                crate::entities::workspace::WorkspaceService::create(
                    &state,
                    crate::entities::workspace::db::CreateWorkspaceDto {
                        name: format!("{}'s workspace", created_user.username),
                        owner_id: created_user.id,
                    },
                )
                .await?;

                match fetch_png_avatar(&created_user.username).await {
                    Err(e) => tracing::warn!("Failed to fetch initials avatar: {e}"),
                    Ok(png_bytes) => {
                        let form = reqwest::multipart::Form::new().part(
                            "file",
                            reqwest::multipart::Part::bytes(png_bytes).file_name("avatar.png"),
                        );
                        match reqwest::Client::new()
                            .post(format!("{}/internal/upload", state.storage_service_url))
                            .multipart(form)
                            .send()
                            .await
                        {
                            Err(e) => tracing::warn!("Failed to upload initials avatar: {e}"),
                            Ok(resp) => match resp.json::<StorageBlobResponse>().await {
                                Err(e) => tracing::warn!("Failed to parse storage response for avatar: {e}"),
                                Ok(blob) => {
                                    match crate::entities::assets::db::AssetsRepository::create(
                                        &state.postgres,
                                        crate::entities::assets::db::CreateAssetDto {
                                            id: Some(Uuid::new_v4()),
                                            name: "avatar.png".to_string(),
                                            blob_id: blob.id,
                                            entity_id: created_user.id,
                                            entity_type: EntityType::UserAvatar,
                                        },
                                    )
                                    .await
                                    {
                                        Err(e) => tracing::warn!("Failed to create avatar asset: {e}"),
                                        Ok(asset) => {
                                            if let Err(e) = user::UserRepository::update_by_authentik_id(
                                                &state.postgres,
                                                payload.pk,
                                                user::UpdateUserDto {
                                                    username: None,
                                                    is_active: None,
                                                    email: None,
                                                    picture: Some(Some(format!("/files/{}", asset.id))),
                                                    is_avatar_default: Some(true),
                                                },
                                            )
                                            .await
                                            {
                                                tracing::warn!("Failed to set avatar picture on user: {e}");
                                            }
                                        }
                                    }
                                }
                            },
                        }
                    }
                }
            }
        }
        UserLifecycleEvents::Deleted(payload) => {
            user::UserRepository::delete_by_authentik_id(&state.postgres, payload.pk)
                .await
                .map_err(ErrorResponse::from)?;
        }
    }

    Ok(axum::http::StatusCode::CREATED)
}
