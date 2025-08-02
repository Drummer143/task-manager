use uuid::Uuid;

use crate::shared::traits::{
    PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
    PostgresqlRepositoryUpdate, RepositoryBase,
};

use super::model::Task;

pub struct TaskRepository;

impl RepositoryBase for TaskRepository {
    type Response = Task;
}

impl PostgresqlRepositoryCreate for TaskRepository {
    type CreateDto = super::dto::CreateTaskDto;

    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Task>("INSERT INTO tasks (title, status_id, due_date, assignee_id, page_id, reporter_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *")
            .bind(dto.title)
            .bind(dto.status_id)
            .bind(dto.due_date)
            .bind(dto.assignee_id)
            .bind(dto.page_id)
            .bind(dto.reporter_id)
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryUpdate for TaskRepository {
    type UpdateDto = super::dto::UpdateTaskDto;

    async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        let mut query_builder = sqlx::QueryBuilder::new("UPDATE tasks SET ");

        let mut separated = query_builder.separated(", ");

        if let Some(title) = dto.title {
            separated.push("title = ").push_bind_unseparated(title);
        }

        if let Some(status_id) = dto.status_id {
            separated.push("status_id = ").push_bind_unseparated(status_id);
        }

        if let Some(due_date) = dto.due_date {
            separated.push("due_date = ").push_bind_unseparated(due_date);
        }

        if let Some(assignee_id) = dto.assignee_id {
            separated.push("assignee_id = ").push_bind_unseparated(assignee_id);
        }

        query_builder
            .push(" WHERE id = ")
            .push_bind(id)
            .push(" RETURNING *")
            .build_query_as::<Task>()
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryGetOneById for TaskRepository {
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE id = $1")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryDelete for TaskRepository {
    async fn delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Task>("DELETE FROM tasks WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}

impl TaskRepository {
    pub async fn get_all_tasks_by_page_id<'a>(
        db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        page_id: Uuid,
    ) -> Result<Vec<Task>, sqlx::Error> {
        sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE page_id = $1")
            .bind(page_id)
            .fetch_all(db)
            .await
    }

    pub async fn change_status<'a>(
        db: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: Uuid,
        status_id: Uuid,
    ) -> Result<Task, sqlx::Error> {
        sqlx::query_as::<_, Task>("UPDATE tasks SET status_id = $1 WHERE id = $2 RETURNING *")
            .bind(status_id)
            .bind(id)
            .fetch_one(db)
            .await
    }
}
