use axum::{
    extract::{Extension, Path, State},
    Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::task::dto::{CreateTaskDto, TaskResponse},
    shared::traits::ServiceCreateMethod,
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
    Extension(reporter_id): Extension<Uuid>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(dto): Json<CreateTaskDto>,
) -> Result<TaskResponse, ErrorResponse> {
    crate::entities::task::TaskService::create(
        &state,
        rust_api::entities::task::dto::CreateTaskDto {
            title: dto.title,
            status: dto.status,
            description: dto.description,
            due_date: dto.due_date,
            assignee_id: dto.assignee_id,
            reporter_id,
            page_id,
        },
    )
    .await
    .map(TaskResponse::from)
}
