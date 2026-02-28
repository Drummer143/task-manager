use std::collections::HashMap;

use axum::{Extension, Json, extract::State, http::StatusCode};
use error_handlers::handlers::ErrorResponse;
use sql::{
    assets::model::EntityType,
    shared::traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, PostgresqlRepositoryUpdate,
    },
    user::model::User,
};
use uuid::Uuid;

use crate::{
    entities::{
        assets::db::{AssetsRepository, CreateAssetDto, UpdateAssetDto},
        user::db::UserRepository,
    },
    shared::generate_initials_avatar::fetch_png_avatar,
    types::app_state::AppState,
};

#[derive(serde::Deserialize)]
struct StorageBlobResponse {
    id: Uuid,
}

#[utoipa::path(
    delete,
    path = "/profile/avatar",
    operation_id = "delete_avatar",
    responses(
        (status = 200, description = "Updated user with new avatar", body = User),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
    ),
    tags = ["Profile"],
)]
pub async fn delete_avatar(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
) -> Result<Json<User>, ErrorResponse> {
    let user = UserRepository::get_one_by_id(&state.postgres, user_id)
        .await
        .map_err(ErrorResponse::from)?;

    if user.is_avatar_default {
        return Err(ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidBody,
            Some(HashMap::from([
                ("message".to_string(), "User has default avatar".to_string()),
            ])),
            None,
        ));
    }

    let png_bytes = fetch_png_avatar(&user.username).await.map_err(|e| {
        ErrorResponse::internal_server_error(Some(format!("Failed to fetch avatar: {e}")))
    })?;

    // Forward cropped file to storage service
    let form = reqwest::multipart::Form::new().part(
        "file",
        reqwest::multipart::Part::bytes(png_bytes).file_name("avatar.png"),
    );

    let resp = reqwest::Client::new()
        .post(format!("{}/internal/upload", state.storage_service_url))
        .multipart(form)
        .send()
        .await
        .map_err(|e| {
            ErrorResponse::internal_server_error(Some(format!(
                "Failed to upload to storage: {}",
                e
            )))
        })?;

    if resp.status() != StatusCode::CREATED {
        return Err(resp
            .json::<ErrorResponse>()
            .await
            .unwrap_or_else(|e| ErrorResponse::internal_server_error(Some(e.to_string()))));
    }

    let blob: StorageBlobResponse = resp.json().await.map_err(|e| {
        ErrorResponse::internal_server_error(Some(format!(
            "Failed to parse storage response: {}",
            e
        )))
    })?;

    let current_asset = match AssetsRepository::get_user_avatar(&state.postgres, user_id).await {
        Ok(asset) => Some(asset),
        Err(sqlx::Error::RowNotFound) => None,
        Err(e) => {
            return Err(ErrorResponse::from(e));
        }
    };

    let current_asset = if let Some(asset) = current_asset {
        AssetsRepository::update(
            &state.postgres,
            asset.id,
            UpdateAssetDto {
                id: Some(Uuid::new_v4()),
                blob_id: Some(blob.id),
                name: None,
            },
        )
        .await
        .map_err(ErrorResponse::from)
    } else {
        AssetsRepository::create(
            &state.postgres,
            CreateAssetDto {
                id: Some(Uuid::new_v4()),
                name: "avatar.png".to_string(),
                blob_id: blob.id,
                entity_id: user_id,
                entity_type: EntityType::UserAvatar,
            },
        )
        .await
        .map_err(ErrorResponse::from)
    }?;

    // Update user picture
    let user = UserRepository::update(
        &state.postgres,
        user_id,
        crate::entities::user::db::dto::UpdateUserDto {
            username: None,
            is_active: None,
            email: None,
            picture: Some(Some(format!("/files/{}", current_asset.id))),
            is_avatar_default: Some(true),
        },
    )
    .await
    .map_err(ErrorResponse::from)?;

    Ok(Json(user))
}
