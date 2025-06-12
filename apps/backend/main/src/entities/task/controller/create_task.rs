use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::{
    entities::task::dto::{CreateTaskDto, TaskResponse},
    shared::error_handlers::handlers::ErrorResponse,
};

#[utoipa::path(
    post,
    path = "/workspaces/{workspace_id}/pages/{page_id}/tasks",
    responses(
        (status = 200, description = "Task created successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body(content = CreateTaskDto),
    tag = "Tasks",
)]
pub async fn create_task(
    State(state): State<crate::types::app_state::AppState>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(dto): Json<CreateTaskDto>,
) -> Result<TaskResponse, ErrorResponse> {
    crate::entities::task::service::create_task(&state.postgres, page_id, dto)
        .await
        .map(TaskResponse::from)
}
