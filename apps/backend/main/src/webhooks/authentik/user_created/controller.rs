use axum::{Json, extract::State};
use chrono::{DateTime, Utc};
use error_handlers::handlers::ErrorResponse;
use rust_api::shared::traits::PostgresqlRepositoryCreate;
use uuid::Uuid;

use crate::shared::traits::ServiceCreateMethod;

#[derive(serde::Deserialize, utoipa::ToSchema)]
pub struct Dto {
    id: Uuid,
    username: String,
    email: String,
    created_at: DateTime<Utc>,
}

#[utoipa::path(
    post,
    path = "/webhooks/authentik/user_created",
    request_body = Dto,
    responses(
        (status = 200, description = "User created successfully"),
        (status = 400, description = "Invalid request body", body = error_handlers::handlers::ErrorResponse),
    ),
    tags = ["Webhooks"],
)]
pub async fn user_created(
    State(state): State<crate::types::app_state::AppState>,
    Json(payload): Json<Dto>,
) -> impl axum::response::IntoResponse {
    use rust_api::entities::user;

    let user = user::UserRepository::create(
        &state.postgres,
        user::dto::CreateUserDto {
            email: payload.email,
            username: payload.username,
            id: Some(payload.id),
            created_at: Some(payload.created_at),
            picture: None,
        },
    )
    .await;

    if let Err(err) = user {
        return Err(ErrorResponse::internal_server_error(Some(err.to_string())));
    }

    let user = user.unwrap();

    crate::entities::workspace::WorkspaceService::create(
        &state,
        rust_api::entities::workspace::dto::CreateWorkspaceDto {
            name: format!("{}'s workspace", user.username),
            owner_id: user.id,
        },
    )
    .await?;

    Ok(axum::http::StatusCode::CREATED)
}
