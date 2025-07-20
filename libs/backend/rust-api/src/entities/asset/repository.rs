use sqlx::Postgres;
use uuid::Uuid;

use crate::{
    entities::asset::model::Asset,
    shared::traits::{PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, RepositoryBase},
};

pub struct AssetRepository;

impl RepositoryBase for AssetRepository {
    type Response = Asset;
}

impl PostgresqlRepositoryGetOneById for AssetRepository {
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Asset>("SELECT * FROM assets WHERE id = $1")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryCreate for AssetRepository {
    type CreateDto = super::dto::CreateAssetDto;

    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        entity: Self::CreateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Asset>(
            "INSERT INTO assets (name, path, size, id) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(entity.name)
        .bind(entity.path)
        .bind(entity.size)
        .bind(entity.id)
        .fetch_one(executor)
        .await
    }
}
