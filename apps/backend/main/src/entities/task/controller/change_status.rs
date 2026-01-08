use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;
use sql::task::dto::ChangeStatusDto;
use uuid::Uuid;

use crate::{entities::task::dto::TaskResponse, shared::extractors::json::ValidatedJson};

#[utoipa::path(
    patch,
    path = "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/status",
    request_body = ChangeStatusDto,
    responses(
        (status = 200, description = "Task status changed successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Task not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
        ("task_id" = Uuid, Path, description = "Task ID"),
    ),
    tag = "Tasks",
)]
#[deprecated]
pub async fn change_status(
    State(state): State<crate::types::app_state::AppState>,
    Path((_, _, task_id)): Path<(Uuid, Uuid, Uuid)>,
    ValidatedJson(dto): ValidatedJson<ChangeStatusDto>,
) -> Result<TaskResponse, ErrorResponse> {
    crate::entities::task::TaskService::change_status(&state, task_id, dto)
        .await
        .map(TaskResponse::from)
}
