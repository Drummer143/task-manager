use axum::{extract::State, Extension, Json};
use error_handlers::handlers::ErrorResponse;
use repo::entities::workspace::dto::WorkspaceRequestDto;

use crate::entities::workspace::dto::WorkspaceResponse;

#[utoipa::path(
    post,
    path = "/workspaces",
    operation_id = "create_workspace",
    responses(
        (status = 200, description = "Workspace created", body = WorkspaceRequestDto),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"],
    request_body = WorkspaceRequestDto,
)]
pub async fn create_workspace(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    Json(json): Json<WorkspaceRequestDto>,
) -> Result<WorkspaceResponse, ErrorResponse> {
    let workspace = crate::entities::workspace::service::create_workspace(
        &state.postgres,
        repo::entities::workspace::dto::CreateWorkspaceDto {
            name: json.name,
            owner_id: user_id,
        },
    )
    .await
    .map_err(|_| ErrorResponse::internal_server_error())?;

    Ok(workspace.into())
}
