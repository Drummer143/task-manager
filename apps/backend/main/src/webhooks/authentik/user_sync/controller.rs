// use std::fs;

use axum::extract::State;
use chrono::{DateTime, Utc};
use error_handlers::handlers::ErrorResponse;
use sql::shared::traits::PostgresqlRepositoryCreate;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::shared::{extractors::json::ValidatedJson, traits::ServiceCreateMethod};

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
pub enum Events {
    UserCreated(UserData),
    UserUpdated(UserData),
    UserDeleted(UserDeletedData),
}

#[utoipa::path(
    post,
    path = "/webhooks/authentik/user_sync",
    request_body = Events,
    responses(
        (status = 200, description = "User created successfully"),
        (status = 400, description = "Invalid request body", body = error_handlers::handlers::ErrorResponse),
    ),
    tags = ["Webhooks"],
)]
pub async fn user_sync(
    State(state): State<crate::types::app_state::AppState>,
    ValidatedJson(payload): ValidatedJson<Events>,
) -> Result<axum::http::StatusCode, ErrorResponse> {
    use sql::user;

    match payload {
        Events::UserUpdated(payload) => {
            user::UserRepository::update_by_authentik_id(
                &state.postgres,
                payload.pk,
                user::dto::UpdateUserDto {
                    email: Some(payload.email),

                    is_active: Some(payload.is_active),
                    username: Some(payload.username),

                    picture: None,
                },
            )
            .await
            .map_err(ErrorResponse::from)?;
        }
        Events::UserCreated(payload) => {
            let user = user::UserRepository::create(
                &state.postgres,
                user::dto::CreateUserDto {
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
                sql::workspace::dto::CreateWorkspaceDto {
                    name: format!("{}'s workspace", user.username),
                    owner_id: user.id,
                },
            )
            .await?;
        }
        Events::UserDeleted(payload) => {
            sql::user::UserRepository::delete_by_authentik_id(
                &state.postgres,
                payload.pk,
            )
            .await
            .map_err(ErrorResponse::from)?;
        }
    }

    Ok(axum::http::StatusCode::CREATED)
}
