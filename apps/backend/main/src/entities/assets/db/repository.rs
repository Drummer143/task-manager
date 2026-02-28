use sqlx::Postgres;
use uuid::Uuid;

use sql::{
    assets::model::{Asset, EntityType},
    shared::traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, PostgresqlRepositoryUpdate,
        RepositoryBase,
    },
};

use crate::entities::assets::db::UpdateAssetDto;

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

impl PostgresqlRepositoryUpdate for AssetsRepository {
    type UpdateDto = UpdateAssetDto;

    async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        let mut query_builder = sqlx::QueryBuilder::new("UPDATE assets SET ");

        let mut separated = query_builder.separated(", ");

        if let Some(id) = dto.id {
            separated.push("id = ").push_bind_unseparated(id);
        }

        if let Some(blob_id) = dto.blob_id {
            separated.push("blob_id = ").push_bind_unseparated(blob_id);
        }

        if let Some(name) = dto.name {
            separated.push("name = ").push_bind_unseparated(name);
        }

        query_builder
            .push(" WHERE id = ")
            .push_bind(id)
            .push(" RETURNING *;")
            .build_query_as::<Asset>()
            .fetch_one(executor)
            .await
    }
}

impl AssetsRepository {
    pub async fn get_user_avatar<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        user_id: Uuid,
    ) -> Result<Asset, sqlx::Error> {
        sqlx::query_as::<_, Asset>("SELECT * FROM assets WHERE entity_id = $1 AND entity_type = $2")
            .bind(user_id)
            .bind(EntityType::UserAvatar)
            .fetch_one(executor)
            .await
    }
}
