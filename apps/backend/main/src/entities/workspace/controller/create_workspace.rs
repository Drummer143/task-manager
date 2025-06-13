use axum::{extract::State, Extension, Json};
use error_handlers::handlers::ErrorResponse;

use crate::entities::workspace::dto::WorkspaceResponse;

#[utoipa::path(
    post,
    path = "/workspaces",
    operation_id = "create_workspace",
    responses(
        (status = 200, description = "Workspace created", body = crate::entities::workspace::dto::WorkspaceRequestDto),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"],
    request_body = crate::entities::workspace::dto::WorkspaceRequestDto,
)]
pub async fn create_workspace(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    Json(json): Json<crate::entities::workspace::dto::WorkspaceRequestDto>,
) -> Result<WorkspaceResponse, ErrorResponse> {
    let workspace = crate::entities::workspace::service::create_workspace(
        &state.postgres,
        crate::entities::workspace::dto::CreateWorkspaceDto {
            name: json.name,
            owner_id: user_id,
        },
    )
    .await
    .map_err(|_| ErrorResponse::internal_server_error())?;

    Ok(workspace.into())
}
