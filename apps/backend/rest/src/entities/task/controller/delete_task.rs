use axum::extract::{Path, State};
use uuid::Uuid;

use crate::{entities::task::dto::TaskResponse, shared::error_handlers::handlers::ErrorResponse};

#[utoipa::path(
    delete,
    path = "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}",
    responses(
        (status = 200, description = "Task deleted successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
        ("task_id" = Uuid, Path, description = "Task ID"),
    ),
    tag = "Tasks",
)]
pub async fn delete_task<'a>(
    State(state): State<crate::types::app_state::AppState>,
    Path(page_id): Path<Uuid>,
) -> Result<TaskResponse, ErrorResponse> {
    crate::entities::task::service::delete_task(&state.db, page_id)
        .await
        .map(TaskResponse::from)
}
