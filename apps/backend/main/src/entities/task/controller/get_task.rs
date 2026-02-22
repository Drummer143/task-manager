use axum::{Json, extract::{Path, State}};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::{board_statuses::dto::BoardStatusResponse, task::dto::TaskResponse},
    shared::traits::ServiceGetOneByIdMethod,
};

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
    let task = crate::entities::task::TaskService::get_one_by_id(&state, task_id).await?;

    let reporter =
        crate::entities::user::UserService::get_one_by_id(&state, task.reporter_id).await?;
    let assignee = if let Some(assignee_id) = task.assignee_id {
        Some(crate::entities::user::UserService::get_one_by_id(&state, assignee_id).await?)
    } else {
        None
    };

    let lang = headers
        .get("User-Language")
        .map(|h| h.to_str().unwrap_or("en"))
        .unwrap_or("en");

    let board_status =
        crate::entities::board_statuses::BoardStatusService::get_one_by_id(&state, task.status_id)
            .await?;

    let mut task_response = TaskResponse::from(task);

    task_response.reporter = Some(reporter);
    task_response.assignee = assignee;
    task_response.status = Some(BoardStatusResponse {
        id: board_status.id,
        title: board_status.localizations.get(lang).unwrap().to_string(),
        initial: board_status.initial,
    });

    Ok(Json(task_response))
}
