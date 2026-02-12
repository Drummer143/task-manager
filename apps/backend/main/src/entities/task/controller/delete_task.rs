use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::task::dto::TaskResponse, shared::traits::ServiceDeleteMethod};

#[utoipa::path(
    delete,
    path = "/tasks/{task_id}",
    responses(
        (status = 200, description = "Task deleted successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("task_id" = Uuid, Path, description = "Task ID"),
    ),
    tag = "Tasks",
)]
pub async fn delete_task(
    State(state): State<crate::types::app_state::AppState>,
    Path(task_id): Path<Uuid>,
) -> Result<TaskResponse, ErrorResponse> {
    crate::entities::task::TaskService::delete(&state, task_id)
        .await
        .map(TaskResponse::from)
}
