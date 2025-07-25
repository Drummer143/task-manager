use axum::{
    extract::{Path, State},
    Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::task::dto::TaskResponse, shared::traits::ServiceGetOneByIdMethod};

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
    Path((_, page_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<Vec<TaskResponse>>, ErrorResponse> {
    let tasks =
        crate::entities::task::TaskService::get_all_tasks_by_page_id(&state, page_id).await?;

    let mut task_responses = Vec::new();

    for task in tasks {
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

        task_responses.push(task_response);
    }

    Ok(Json(task_responses))
}
