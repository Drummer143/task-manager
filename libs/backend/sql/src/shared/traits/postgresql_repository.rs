#![allow(async_fn_in_trait)]

use sqlx::Postgres;
use uuid::Uuid;

pub trait RepositoryBase {
    type Response;
}

pub trait PostgresqlRepositoryGetOneById
where
    Self: RepositoryBase,
{
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Self::Response, sqlx::Error>;
}

pub trait PostgresqlRepositoryGetAll
where
    Self: RepositoryBase,
{
    async fn get_all<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
    ) -> Result<Self::Response, sqlx::Error>;
}

pub trait PostgresqlRepositoryCreate
where
    Self: RepositoryBase,
{
    type CreateDto;
    async fn create<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, sqlx::Error>;
}

pub trait PostgresqlRepositoryUpdate
where
    Self: RepositoryBase,
{
    type UpdateDto;
    async fn update<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, sqlx::Error>;
}

pub trait PostgresqlRepositoryDelete
where
    Self: RepositoryBase,
{
    async fn delete<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Self::Response, sqlx::Error>;
}
