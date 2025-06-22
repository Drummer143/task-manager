use axum::{
    extract::{Extension, Path, State},
    Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::entities::task::dto::{CreateTaskDto, TaskResponse};

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
    Extension(reporter_id): Extension<Uuid>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(dto): Json<CreateTaskDto>,
) -> Result<TaskResponse, ErrorResponse> {
    crate::entities::task::service::create_task(&state.postgres, page_id, reporter_id, dto)
        .await
        .map(TaskResponse::from)
}
