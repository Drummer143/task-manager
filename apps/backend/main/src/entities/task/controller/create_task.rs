use axum::extract::{Extension, Path, State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::task::dto::{CreateTaskDto, TaskResponse},
    shared::{extractors::json::ValidatedJson, traits::ServiceCreateMethod},
};

#[utoipa::path(
    post,
    path = "/pages/{page_id}/tasks",
    responses(
        (status = 200, description = "Task created successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body(content = CreateTaskDto),
    tag = "Tasks",
)]
pub async fn create_task(
    State(state): State<crate::types::app_state::AppState>,
    Extension(reporter_id): Extension<Uuid>,
    Path(page_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<CreateTaskDto>,
) -> Result<TaskResponse, ErrorResponse> {
    let last_position =
        sql::task::TaskRepository::get_last_position(&state.postgres, dto.status_id)
            .await
            .map_err(ErrorResponse::from)?
            .unwrap_or_default();

    crate::entities::task::TaskService::create(
        &state,
        sql::task::dto::CreateTaskDto {
            title: dto.title,
            status_id: dto.status_id,
            description: dto.description,
            due_date: dto.due_date,
            assignee_id: dto.assignee_id,
            reporter_id,
            page_id,
            position: last_position + 1,
        },
    )
    .await
    .map(TaskResponse::from)
}
