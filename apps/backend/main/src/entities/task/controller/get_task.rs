use axum::{Json, extract::{Path, State}};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::entities::task::dto::TaskResponse;

#[utoipa::path(
    get,
    path = "/tasks/{task_id}",
    operation_id = "get_task",
    responses(
        (status = 200, description = "Task retrieved successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("task_id" = Uuid, Path, description = "Task ID"),
    ),
    tag = "Tasks",
)]
pub async fn get_task(
    State(state): State<crate::types::app_state::AppState>,
    Path(task_id): Path<Uuid>,
    headers: axum::http::header::HeaderMap,
) -> Result<Json<TaskResponse>, ErrorResponse> {
    let lang = headers
        .get("User-Language")
        .map(|h| h.to_str().unwrap_or("en"))
        .unwrap_or("en");

    crate::entities::task::TaskService::get_task_with_details(&state.postgres, task_id, lang)
        .await
        .map(Json)
}
