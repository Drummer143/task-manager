use super::dto::CreateBlobDto;
use sql::blobs::model::Blob;
use sql::shared::traits::{
    PostgresqlRepositoryCreate, PostgresqlRepositoryGetOneById, RepositoryBase,
};

pub struct BlobsRepository;

impl RepositoryBase for BlobsRepository {
    type Response = Blob;
}

impl PostgresqlRepositoryCreate for BlobsRepository {
    type CreateDto = CreateBlobDto;

    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Blob>(
            "INSERT INTO blobs (hash, size, path, mime_type) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(dto.hash)
        .bind(dto.size)
        .bind(dto.path)
        .bind(dto.mime_type)
        .fetch_one(executor)
        .await
    }
}

impl PostgresqlRepositoryGetOneById for BlobsRepository {
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        id: uuid::Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Blob>("SELECT * FROM blobs WHERE id = $1")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}

// impl PostgresqlRepositoryDelete for BlobsRepository {
//     async fn delete<'a>(
//         executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
//         id: uuid::Uuid,
//     ) -> Result<Self::Response, sqlx::Error> {
//         sqlx::query_as::<_, Blob>("DELETE FROM blobs WHERE id = $1 RETURNING *")
//             .bind(id)
//             .fetch_one(executor)
//             .await
//     }
// }

impl BlobsRepository {
    pub async fn get_one_by_hash<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        hash: &str,
    ) -> Result<Blob, sqlx::Error> {
        sqlx::query_as::<_, Blob>("SELECT * FROM blobs WHERE hash = $1")
            .bind(hash)
            .fetch_one(executor)
            .await
    }

    pub async fn get_all_blob_ids<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<uuid::Uuid>, sqlx::Error> {
        #[derive(sqlx::FromRow)]
        struct BlobIdRow {
            id: uuid::Uuid,
        }
        
        let rows: Vec<BlobIdRow> = sqlx::query_as::<_, BlobIdRow>("SELECT id FROM blobs LIMIT $1 OFFSET $2")
            .bind(limit)
            .bind(offset)
            .fetch_all(executor)
            .await?;
            
        Ok(rows.into_iter().map(|r| r.id).collect())
    }
    
    pub async fn delete_blobs<'a>(
        executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
        ids: &[uuid::Uuid],
    ) -> Result<Vec<Blob>, sqlx::Error> {
        if ids.is_empty() {
            return Ok(vec![]);
        }
        
        let mut query_builder = sqlx::QueryBuilder::new("DELETE FROM blobs WHERE id = ANY(");
        query_builder.push_bind(ids);
        query_builder.push(") RETURNING *");
        
        query_builder
            .build_query_as::<Blob>()
            .fetch_all(executor)
            .await
    }
}
