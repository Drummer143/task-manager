use uuid::Uuid;

use sql::shared::{
    traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
        PostgresqlRepositoryUpdate, RepositoryBase,
    },
    types::ShiftAction,
};

use sql::task::model::Task;

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
        sqlx::query_as::<_, Task>(
            r#"
            INSERT INTO tasks
            (title, status_id, position, due_date, assignee_id, page_id, reporter_id, description, is_draft)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            "#,
        )
        .bind(dto.title)
        .bind(dto.status_id)
        .bind(dto.position)
        .bind(dto.due_date)
        .bind(dto.assignee_id)
        .bind(dto.page_id)
        .bind(dto.reporter_id)
        .bind(sqlx::types::Json(&dto.description))
        .bind(dto.is_draft)
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

        if let Some(position) = dto.position {
            separated
                .push("position = ")
                .push_bind_unseparated(position);
        }

        if let Some(status_id) = dto.status_id {
            separated
                .push("status_id = ")
                .push_bind_unseparated(status_id);
        }

        if let Some(due_date) = dto.due_date {
            separated
                .push("due_date = ")
                .push_bind_unseparated(due_date);
        }

        if let Some(assignee_id) = dto.assignee_id {
            separated
                .push("assignee_id = ")
                .push_bind_unseparated(assignee_id);
        }

        if let Some(description) = dto.description {
            separated
                .push("description = ")
                .push_bind_unseparated(sqlx::types::Json(description));
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
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        page_id: Uuid,
    ) -> Result<Vec<Task>, sqlx::Error> {
        sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE page_id = $1 ORDER BY position ASC")
            .bind(page_id)
            .fetch_all(executor)
            .await
    }

    pub async fn get_last_position<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        status_id: Uuid,
    ) -> Result<Option<i32>, sqlx::Error> {
        sqlx::query_scalar::<_, Option<i32>>("SELECT MAX(position) FROM tasks WHERE status_id = $1")
            .bind(status_id)
            .fetch_one(executor)
            .await
    }

    pub async fn shift_tasks_position<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        status_id: Uuid,
        start_position: Option<i32>,
        end_position: Option<i32>,
        action: ShiftAction,
    ) -> Result<(), sqlx::Error> {
        let mut query =
            sqlx::query_builder::QueryBuilder::new("UPDATE tasks SET position = position ");

        query
            .push(action.to_string())
            .push(" 1 WHERE status_id = ")
            .push_bind(status_id)
            .push(" AND position >= ")
            .push_bind(start_position.unwrap_or(1));

        if let Some(end_position) = end_position {
            query.push(" AND position <= ").push_bind(end_position);
        }

        query.build().execute(executor).await.map(|_| ())
    }

    pub async fn has_access<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        task_id: Uuid,
        user_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        sqlx::query_scalar(
            r#"
            SELECT EXISTS (
                SELECT 1 FROM page_access pa
                JOIN task t ON t.page_id = pa.page_id
                WHERE pa.user_id = $1 AND t.id = $2
            )
            "#,
        )
        .bind(user_id)
        .bind(task_id)
        .fetch_one(executor)
        .await
    }
}
