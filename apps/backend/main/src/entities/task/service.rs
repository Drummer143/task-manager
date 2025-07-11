use error_handlers::handlers::ErrorResponse;
use rust_api::entities::task::{model::Task, repository};
use uuid::Uuid;

pub async fn create_task<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
    reporter_id: Uuid,
    dto: rust_api::entities::task::dto::CreateTaskDto,
) -> Result<Task, ErrorResponse> {
    repository::create_task(executor, page_id, reporter_id, dto)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn update_task<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
    dto: rust_api::entities::task::dto::UpdateTaskDto,
) -> Result<Task, ErrorResponse> {
    repository::update_task(executor, task_id, dto)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn change_status<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
    dto: rust_api::entities::task::dto::ChangeStatusDto,
) -> Result<Task, ErrorResponse> {
    repository::change_status(executor, task_id, dto.status)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn delete_task<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
) -> Result<Task, ErrorResponse> {
    repository::delete_task(executor, task_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_task_by_id<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
) -> Result<Task, ErrorResponse> {
    repository::get_task_by_id(executor, task_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_all_tasks_by_page_id<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<Vec<Task>, ErrorResponse> {
    repository::get_all_tasks_by_page_id(executor, page_id)
        .await
        .map_err(ErrorResponse::from)
}
