use uuid::Uuid;

use crate::entities::board_statuses::{dto, model::BoardStatus};

pub async fn create_board_status<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
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
    .bind(sqlx::types::Json(dto.localizations))
    .bind(dto.initial)
    .fetch_one(executor)
    .await
}

pub async fn update_board_status<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    status_id: Uuid,
    dto: dto::UpdateBoardStatusDto,
) -> Result<BoardStatus, sqlx::Error> {
    let mut builder = sqlx::QueryBuilder::new("UPDATE board_statuses SET position = ");

    builder
        .push_bind(dto.position)
        .push(", initial = ")
        .push_bind(dto.initial.unwrap_or(false));

    if let Some(localizations) = dto.localizations {
        builder
            .push(", localizations = ")
            .push_bind(sqlx::types::Json(localizations));
    }

    builder
        .push(" WHERE id = ")
        .push_bind(status_id)
        .push(" RETURNING *")
        .build_query_as::<BoardStatus>()
        .fetch_one(executor)
        .await
}

pub async fn get_board_status_by_id<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    status_id: Uuid,
) -> Result<BoardStatus, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>("SELECT * FROM board_statuses WHERE id = $1")
        .bind(status_id)
        .fetch_one(executor)
        .await
}

pub async fn get_board_statuses_by_page_id<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<Vec<BoardStatus>, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>(
        "SELECT * FROM board_statuses WHERE page_id = $1 ORDER BY position ASC",
    )
    .bind(page_id)
    .fetch_all(executor)
    .await
}

pub async fn get_initial_board_status_by_page_id<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
) -> Result<BoardStatus, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>(
        "SELECT * FROM board_statuses WHERE page_id = $1 AND initial = true",
    )
    .bind(page_id)
    .fetch_one(executor)
    .await
}

pub async fn delete_board_status<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    status_id: Uuid,
) -> Result<BoardStatus, sqlx::Error> {
    sqlx::query_as::<_, BoardStatus>("DELETE FROM board_statuses WHERE id = $1 RETURNING *")
        .bind(status_id)
        .fetch_one(executor)
        .await
}

pub async fn shift_board_status_positions<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    page_id: Uuid,
    from: i32,
    to: Option<i32>,
    action: dto::StatusShiftAction,
    direction: dto::StatusShiftDirection,
) -> Result<(), sqlx::Error> {
    let action = match action {
        dto::StatusShiftAction::Increment => "+",
        dto::StatusShiftAction::Decrement => "-",
    };
    let direction = match direction {
        dto::StatusShiftDirection::Less => "<",
        dto::StatusShiftDirection::Greater => ">",
    };

    let mut builder = sqlx::QueryBuilder::new("UPDATE board_statuses ");

    builder
        .push("SET position = position ")
        .push(action)
        .push(" 1 ");

    builder
        .push("WHERE page_id = ")
        .push_bind(page_id)
        .push(" AND position ");

    if let Some(to) = to {
        builder
            .push("BETWEEN ")
            .push_bind(from)
            .push(" AND ")
            .push_bind(to);
    } else {
        builder.push(direction).push_bind(from);
    }

    builder.build().execute(executor).await.map(|_| ())
}
