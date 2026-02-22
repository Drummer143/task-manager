use sqlx::Postgres;
use uuid::Uuid;

use sql::{
    assets::model::Asset,
    shared::traits::{PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, RepositoryBase},
};

pub struct AssetsRepository;

impl RepositoryBase for AssetsRepository {
    type Response = Asset;
}

impl PostgresqlRepositoryGetOneById for AssetsRepository {
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

impl PostgresqlRepositoryCreate for AssetsRepository {
    type CreateDto = super::dto::CreateAssetDto;

    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        entity: Self::CreateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Asset>(
            "INSERT INTO assets (name, blob_id, entity_id, entity_type, id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        )
        .bind(entity.name)
        .bind(entity.blob_id)
        .bind(entity.entity_id)
        .bind(entity.entity_type)
        .bind(entity.id)
        .fetch_one(executor)
        .await
    }
}
