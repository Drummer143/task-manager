use axum::{
    extract::{Path, State},
    response::IntoResponse,
};

use error_handlers::handlers::ErrorResponse;

use crate::services::workspaces::WorkspaceService;

#[utoipa::path(
    delete,
    path = "/workspaces/{workspace_id}",
    operation_id = "soft_delete_workspace",
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    responses(
        (status = 200, description = "Workspace soft deleted", body = ()),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"],
)]
pub async fn soft_delete(
    State(state): State<crate::types::app_state::AppState>,
    Path(workspace_id): Path<uuid::Uuid>,
) -> impl IntoResponse {
    WorkspaceService::soft_delete(&state.postgres, workspace_id).await
}
