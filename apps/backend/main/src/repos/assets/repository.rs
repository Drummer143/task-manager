use sqlx::Postgres;
use uuid::Uuid;

use sql::{
    assets::model::{Asset, EntityType},
    shared::traits::RepositoryBase,
};

use super::dto::{CreateAssetDto, UpdateAssetDto};

pub struct AssetsRepository;

impl RepositoryBase for AssetsRepository {
    type Response = Asset;
}

impl AssetsRepository {
    pub async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Asset, sqlx::Error> {
        sqlx::query_as::<_, Asset>("SELECT * FROM assets WHERE id = $1")
            .bind(id)
            .fetch_one(executor)
            .await
    }

    pub async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        entity: CreateAssetDto,
    ) -> Result<Asset, sqlx::Error> {
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

    pub async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
        dto: UpdateAssetDto,
    ) -> Result<Asset, sqlx::Error> {
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

    pub async fn get_existing_blobs<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        blob_ids: &[String],
    ) -> Result<Vec<String>, sqlx::Error> {
        let mut uuids = Vec::new();
        for id in blob_ids {
            if let Ok(u) = Uuid::parse_str(id) {
                uuids.push(u);
            }
        }
        
        if uuids.is_empty() {
            return Ok(vec![]);
        }

        let mut query_builder = sqlx::QueryBuilder::new("SELECT blob_id FROM assets WHERE blob_id = ANY(");
        query_builder.push_bind(uuids);
        query_builder.push(")");
        
        // Use an anonymous tuple with FromRow
        #[derive(sqlx::FromRow)]
        struct BlobIdRow {
            blob_id: Uuid,
        }
        
        let existing: Vec<BlobIdRow> = query_builder.build_query_as::<BlobIdRow>().fetch_all(executor).await?;
        
        Ok(existing.into_iter().map(|row| row.blob_id.to_string()).collect())
    }
}
