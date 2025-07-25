use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::task::dto::TaskResponse, shared::traits::ServiceGetOneByIdMethod};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}",
    responses(
        (status = 200, description = "Task retrieved successfully", body = TaskResponse),
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
pub async fn get_task<'a>(
    State(state): State<crate::types::app_state::AppState>,
    Path((_, _, task_id)): Path<(Uuid, Uuid, Uuid)>,
) -> Result<TaskResponse, ErrorResponse> {
    let task = crate::entities::task::TaskService::get_one_by_id(&state, task_id)
        .await?;

    let reporter =
        crate::entities::user::UserService::get_one_by_id(&state, task.reporter_id).await?;
    let assignee = if let Some(assignee_id) = task.assignee_id {
        Some(crate::entities::user::UserService::get_one_by_id(&state, assignee_id).await?)
    } else {
        None
    };

    let mut task_response = TaskResponse::from(task);

    task_response.reporter = Some(reporter);
    task_response.assignee = assignee;

    Ok(task_response)
}
