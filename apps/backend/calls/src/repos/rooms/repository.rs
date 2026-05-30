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
        // Pre-generate id so we can use it as a name fallback in a single INSERT.
        let id = Uuid::new_v4();
        let name = dto
            .name
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .map(str::to_string)
            .unwrap_or_else(|| id.to_string());

        let room = sqlx::query_as::<_, Room>(
            "INSERT INTO rooms (id, name, visibility, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(id)
        .bind(name)
        .bind(dto.visibility.as_ref().unwrap_or(&RoomVisibility::Private))
        .bind(dto.created_by)
        .fetch_one(executor)
        .await?;
        Ok(room)
    }

    pub async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Room, sqlx::Error> {
        sqlx::query_as::<_, Room>("SELECT * FROM rooms WHERE id = $1 AND deleted_at IS NULL")
            .bind(id)
            .fetch_one(executor)
            .await
    }

    pub async fn get_rooms_by_user<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        user_id: Uuid,
    ) -> Result<Vec<Room>, sqlx::Error> {
        sqlx::query_as::<_, Room>(
            "SELECT * FROM rooms WHERE created_by = $1 AND deleted_at IS NULL ORDER BY created_at DESC",
        )
        .bind(user_id)
        .fetch_all(executor)
        .await
    }

    pub async fn soft_delete<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE rooms SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1")
            .bind(id)
            .execute(executor)
            .await?;
        Ok(())
    }
}
