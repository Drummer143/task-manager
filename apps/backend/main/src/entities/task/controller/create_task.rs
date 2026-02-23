use axum::{Json, extract::{Extension, Path, State}};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::task::dto::{CreateTaskRequest, TaskResponse},
    shared::extractors::json::ValidatedJson,
};

#[utoipa::path(
    post,
    path = "/pages/{page_id}/tasks",
    operation_id = "create_task",
    responses(
        (status = 200, description = "Task created successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = CreateTaskRequest,
    tag = "Tasks",
)]
pub async fn create_task(
    State(state): State<crate::types::app_state::AppState>,
    Extension(reporter_id): Extension<Uuid>,
    Path(page_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<CreateTaskRequest>,
) -> Result<Json<TaskResponse>, ErrorResponse> {
    crate::entities::task::TaskService::create_for_page(&state, page_id, reporter_id, dto)
        .await
        .map(|t| Json(TaskResponse::from(t)))
}
