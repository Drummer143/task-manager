use uuid::Uuid;

use crate::entities::board_statuses::{dto, model::BoardStatus};
use crate::shared::traits::{
    PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
    PostgresqlRepositoryUpdate, RepositoryBase,
};

pub struct BoardStatusRepository;

impl RepositoryBase for BoardStatusRepository {
    type Response = BoardStatus;
}

impl PostgresqlRepositoryCreate for BoardStatusRepository {
    type CreateDto = dto::CreateBoardStatusDto;

    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: dto::CreateBoardStatusDto,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, BoardStatus>(
            r#"
            INSERT INTO board_statuses (page_id, code, type, position, localizations, initial)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            "#,
        )
        .bind(dto.page_id)
        .bind(dto.code)
        .bind(dto.r#type)
        .bind(dto.position)
        .bind(dto.localizations)
        .bind(dto.initial)
        .fetch_one(executor)
        .await
    }
}

impl PostgresqlRepositoryUpdate for BoardStatusRepository {
    type UpdateDto = dto::UpdateBoardStatusDto;

    async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        status_id: Uuid,
        dto: dto::UpdateBoardStatusDto,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, BoardStatus>(
            r#"
            UPDATE board_statuses
            SET position = $1, localizations = $2, initial = $3
        WHERE id = $4
        RETURNING *
        "#,
        )
        .bind(dto.position)
        .bind(dto.localizations)
        .bind(dto.initial)
        .bind(status_id)
        .fetch_one(executor)
        .await
    }
}

impl PostgresqlRepositoryGetOneById for BoardStatusRepository {
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        status_id: Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, BoardStatus>("SELECT * FROM board_statuses WHERE id = $1")
            .bind(status_id)
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryDelete for BoardStatusRepository {
    async fn delete<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        status_id: Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, BoardStatus>("DELETE FROM board_statuses WHERE id = $1 RETURNING *")
            .bind(status_id)
            .fetch_one(executor)
            .await
    }
}

impl BoardStatusRepository {
    pub async fn get_board_statuses_by_page_id(
        executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
        page_id: Uuid,
    ) -> Result<Vec<BoardStatus>, sqlx::Error> {
        sqlx::query_as::<_, BoardStatus>(
            "SELECT * FROM board_statuses WHERE page_id = $1 ORDER BY position ASC",
        )
        .bind(page_id)
        .fetch_all(executor)
        .await
    }

    pub async fn get_initial_board_status_by_page_id(
        executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
        page_id: Uuid,
    ) -> Result<BoardStatus, sqlx::Error> {
        sqlx::query_as::<_, BoardStatus>(
            "SELECT * FROM board_statuses WHERE page_id = $1 AND initial = true",
        )
        .bind(page_id)
        .fetch_one(executor)
        .await
    }
}
