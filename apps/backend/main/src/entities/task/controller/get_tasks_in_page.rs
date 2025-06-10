use axum::{extract::{Path, State}, Json};
use uuid::Uuid;

use crate::{entities::task::dto::TaskResponse, shared::error_handlers::handlers::ErrorResponse};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages/{page_id}/tasks",
    responses(
        (status = 200, description = "Tasks retrieved successfully", body = Vec<TaskResponse>),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    tag = "Tasks",
)]
pub async fn get_tasks_in_page(
    State(state): State<crate::types::app_state::AppState>,
    Path(page_id): Path<Uuid>,
) -> Result<Json<Vec<TaskResponse>>, ErrorResponse> {
    let tasks = crate::entities::task::service::get_all_tasks_by_page_id(&state.db, page_id).await?;

    let mut task_responses = Vec::new();

    for task in tasks {
        let reporter = crate::entities::user::service::find_by_id(&state.db, task.reporter_id).await?;
        let assignee = if let Some(assignee_id) = task.assignee_id {
            Some(crate::entities::user::service::find_by_id(&state.db, assignee_id).await?)
        } else {
            None
        };

        let mut task_response = TaskResponse::from(task);

        task_response.reporter = Some(reporter);
        task_response.assignee = assignee;

        task_responses.push(task_response);
    }

    Ok(Json(task_responses))
}