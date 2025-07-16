use uuid::Uuid;

use crate::entities::board_statuses::{dto, model::BoardStatus};

pub async fn create_board_status(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    dto: dto::CreateBoardStatusDto,
) -> Result<BoardStatus, sqlx::Error> {
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

pub async fn update_board_status(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    status_id: Uuid,
    dto: dto::UpdateBoardStatusDto,
) -> Result<BoardStatus, sqlx::Error> {
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

pub async fn get_board_status_by_id(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    status_id: Uuid,
) -> Result<BoardStatus, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>("SELECT * FROM board_statuses WHERE id = $1")
        .bind(status_id)
        .fetch_one(executor)
        .await
}

pub async fn get_board_statuses_by_page_id(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<Vec<BoardStatus>, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>("SELECT * FROM board_statuses WHERE page_id = $1 ORDER BY position ASC")
        .bind(page_id)
        .fetch_all(executor)
        .await
}

pub async fn get_initial_board_status_by_page_id(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<BoardStatus, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>("SELECT * FROM board_statuses WHERE page_id = $1 AND initial = true")
        .bind(page_id)
        .fetch_one(executor)
        .await
}

pub async fn delete_board_status(
    executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
    status_id: Uuid,
) -> Result<BoardStatus, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>("DELETE FROM board_statuses WHERE id = $1 RETURNING *")
        .bind(status_id)
        .fetch_one(executor)
        .await
}
