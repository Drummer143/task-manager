use axum::{
    extract::{Path, State},
    response::IntoResponse,
};

use error_handlers::handlers::ErrorResponse;

#[utoipa::path(
    delete,
    path = "/workspaces/{workspace_id}/cancel-soft-delete",
    responses(
        (status = 200, description = "Workspace soft deleted successfully"),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"]
)]
pub async fn cancel_soft_delete(
    State(state): State<crate::types::app_state::AppState>,
    Path(workspace_id): Path<uuid::Uuid>,
) -> impl IntoResponse {
    crate::entities::workspace::WorkspaceService::cancel_soft_delete(&state, workspace_id)
        .await
        .map_err(|_| ErrorResponse::internal_server_error(None))
}
