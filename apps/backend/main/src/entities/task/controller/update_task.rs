use axum::{Json, extract::{Path, State}};
use error_handlers::handlers::ErrorResponse;
use crate::entities::task::db::UpdateTaskDto;
use uuid::Uuid;

use crate::{
    entities::task::dto::TaskResponse,
    shared::{extractors::json::ValidatedJson, traits::ServiceUpdateMethod},
};

#[utoipa::path(
    put,
    path = "/tasks/{task_id}",
    responses(
        (status = 200, description = "Task updated successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("task_id" = Uuid, Path, description = "Task ID"),
    ),
    request_body = UpdateTaskDto,
    tag = "Tasks",
)]
pub async fn update_task(
    State(state): State<crate::types::app_state::AppState>,
    Path(task_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<UpdateTaskDto>,
) -> Result<Json<TaskResponse>, ErrorResponse> {
    crate::entities::task::TaskService::update(&state, task_id, dto)
        .await
        .map(|t| Json(TaskResponse::from(t)))
}
