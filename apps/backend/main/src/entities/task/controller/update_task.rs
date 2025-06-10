use axum::{extract::{Path, State}, Json};
use uuid::Uuid;

use crate::{entities::task::dto::{UpdateTaskDto, TaskResponse}, shared::error_handlers::handlers::ErrorResponse};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}",
    responses(
        (status = 200, description = "Task updated successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
        ("task_id" = Uuid, Path, description = "Task ID"),
    ),
    request_body(content = UpdateTaskDto),
    tag = "Tasks",
)]
pub async fn update_task<'a>(
    State(state): State<crate::types::app_state::AppState>,
    Path(page_id): Path<Uuid>,
    Json(dto): Json<UpdateTaskDto>,
) -> Result<TaskResponse, ErrorResponse> {
    crate::entities::task::service::update_task(&state.db, page_id, dto)
        .await
        .map(TaskResponse::from)
}