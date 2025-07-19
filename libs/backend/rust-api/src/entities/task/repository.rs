use uuid::Uuid;

use super::model::Task;

pub async fn create_task<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
    reporter_id: Uuid,
    dto: super::dto::CreateTaskDto,
) -> Result<Task, sqlx::Error> {
    sqlx::query_as::<_, Task>("INSERT INTO tasks (title, status, due_date, assignee_id, page_id, reporter_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *")
        .bind(dto.title)
        .bind(dto.status)
        .bind(dto.due_date)
        .bind(dto.assignee_id)
        .bind(page_id)
        .bind(reporter_id)
        .fetch_one(db)
        .await
}

pub async fn update_task<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    id: Uuid,
    dto: super::dto::UpdateTaskDto,
) -> Result<Task, sqlx::Error> {
    let mut query_builder = sqlx::QueryBuilder::new("UPDATE tasks SET");

    let mut separated = query_builder.separated(", ");

    if let Some(title) = dto.title {
        separated.push("title = ").push_bind(title);
    }

    if let Some(status) = dto.status {
        separated.push("status = ").push_bind(status);
    }

    if let Some(due_date) = dto.due_date {
        separated.push("due_date = ").push_bind(due_date);
    }

    if let Some(assignee_id) = dto.assignee_id {
        separated.push("assignee_id = ").push_bind(assignee_id);
    }

    query_builder
        .push(" WHERE id = ")
        .push_bind(id)
        .push(" RETURNING *")
        .build_query_as::<Task>()
        .fetch_one(db)
        .await
}

pub async fn change_status<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    id: Uuid,
    status: String,
) -> Result<Task, sqlx::Error> {
    sqlx::query_as::<_, Task>("UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *")
        .bind(status)
        .bind(id)
        .fetch_one(db)
        .await
}

pub async fn get_task_by_id<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    id: Uuid,
) -> Result<Task, sqlx::Error> {
    sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE id = $1")
        .bind(id)
        .fetch_one(db)
        .await
}

pub async fn get_all_tasks_by_page_id<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<Vec<Task>, sqlx::Error> {
    sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE page_id = $1")
        .bind(page_id)
        .fetch_all(db)
        .await
}

pub async fn delete_task<'a>(
    db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    id: Uuid,
) -> Result<Task, sqlx::Error> {
    sqlx::query_as::<_, Task>("DELETE FROM tasks WHERE id = $1 RETURNING *")
        .bind(id)
        .fetch_one(db)
        .await
}
