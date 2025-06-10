use uuid::Uuid;

use crate::{
    entities::task::{model::Task, repository},
    shared::error_handlers::handlers::ErrorResponse,
};

pub async fn create_task<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
    dto: super::dto::CreateTaskDto,
) -> Result<Task, ErrorResponse> {
    repository::create_task(db, page_id, dto)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn update_task<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
    dto: super::dto::UpdateTaskDto,
) -> Result<Task, ErrorResponse> {
    repository::update_task(db, task_id, dto)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn change_status<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
    dto: super::dto::ChangeStatusDto,
) -> Result<Task, ErrorResponse> {
    repository::change_status(db, task_id, dto.status)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn delete_task<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
) -> Result<Task, ErrorResponse> {
    repository::delete_task(db, task_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_task_by_id<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    task_id: Uuid,
) -> Result<Task, ErrorResponse> {
    repository::get_task_by_id(db, task_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_all_tasks_by_page_id<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<Vec<Task>, ErrorResponse> {
    repository::get_all_tasks_by_page_id(db, page_id)
        .await
        .map_err(ErrorResponse::from)
}

