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
}
