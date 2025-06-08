use axum::{extract::State, Extension, Json};

use crate::shared::error_handlers::handlers::ErrorResponse;

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}",
    responses(
        (status = 200, description = "Workspace updated successfully", body = crate::entities::workspace::dto::WorkspaceRequestDto),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = crate::entities::workspace::dto::WorkspaceRequestDto,
    tags = ["Workspace"],
)]
#[axum_macros::debug_handler]
pub async fn update_workspace(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    Json(dto): Json<crate::entities::workspace::dto::WorkspaceRequestDto>,
) -> Result<crate::entities::workspace::dto::WorkspaceResponse, ErrorResponse> {
    crate::entities::workspace::service::update_workspace(
        &state.db,
        user_id,
        crate::entities::workspace::dto::WorkspaceDto {
            name: dto.name,
            owner_id: user_id,
        },
    )
    .await
    .map_err(|_| ErrorResponse::internal_server_error())
    .map(|w| w.into())
}
