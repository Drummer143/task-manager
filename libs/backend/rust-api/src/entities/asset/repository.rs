use sqlx::Postgres;
use uuid::Uuid;

use crate::entities::asset::model::Asset;

pub async fn create_asset<'a>(
    executor: impl sqlx::Executor<'a, Database = Postgres>,
    dto: super::dto::CreateAssetDto,
) -> Result<Asset, sqlx::Error> {
    sqlx::query_as::<_, Asset>(
        "INSERT INTO assets (name, path, size, id) VALUES ($1, $2, $3, $4) RETURNING *",
    )
    .bind(dto.name)
    .bind(dto.path)
    .bind(dto.size)
    .bind(dto.id)
    .fetch_one(executor)
    .await
}

pub async fn get_asset_by_id<'a>(
    executor: impl sqlx::Executor<'a, Database = Postgres>,
    id: Uuid,
) -> Result<Asset, sqlx::Error> {
    let asset = sqlx::query_as::<_, Asset>("SELECT * FROM assets WHERE id = $1")
        .bind(id)
        .fetch_one(executor)
        .await?;

    Ok(asset)
}
