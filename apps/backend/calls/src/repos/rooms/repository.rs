use sql::rooms::model::{Room, RoomVisibility};
use sqlx::Postgres;
use uuid::Uuid;

use crate::repos::rooms::dto::CreateRoomDto;

pub struct RoomsRepository;

impl RoomsRepository {
    pub async fn create_room<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        dto: &CreateRoomDto,
    ) -> Result<Room, sqlx::Error> {
        let room = sqlx::query_as::<_, Room>(
            "INSERT INTO rooms (name, visibility, created_by) VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(&dto.name)
        .bind(dto.visibility.as_ref().unwrap_or(&RoomVisibility::Private))
        .bind(&dto.created_by)
        .fetch_one(executor)
        .await?;
        Ok(room)
    }

    pub async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Room, sqlx::Error> {
        sqlx::query_as::<_, Room>("SELECT * FROM rooms WHERE id = $1")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}
