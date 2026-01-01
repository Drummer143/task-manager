use sqlx::{Executor, Postgres};
use uuid::Uuid;

use crate::{
    entities::page::model::{Doc, PageWithContent},
    shared::traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
        PostgresqlRepositoryUpdate, RepositoryBase, UpdateDto,
    },
};

use super::model::Page;

pub struct PageRepository;

impl RepositoryBase for PageRepository {
    type Response = Page;
}

impl PostgresqlRepositoryGetOneById for PageRepository {
    async fn get_one_by_id<'a>(
        executor: impl sqlx::Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE id = $1")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryCreate for PageRepository {
    type CreateDto = super::dto::CreatePageDto;

    async fn create<'a>(
        executor: impl Executor<'a, Database = Postgres>,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Page>(
            r#"
            WITH new_page AS (
                INSERT INTO pages (title, parent_page_id, type, workspace_id, owner_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            )

            INSERT INTO text_page_contents (page_id, content)
            VALUES ((SELECT id FROM new_page), $6);

            SELECT * FROM new_page;
            "#,
        )
        .bind(dto.title)
        .bind(dto.parent_page_id)
        .bind(dto.r#type)
        .bind(dto.workspace_id)
        .bind(dto.owner_id)
        .bind(sqlx::types::Json(dto.content))
        .fetch_one(executor)
        .await
    }
}

impl PostgresqlRepositoryUpdate for PageRepository {
    type UpdateDto = super::dto::UpdatePageDto;

    async fn update<'a>(
        executor: impl Executor<'a, Database = Postgres>,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, sqlx::Error> {
        if dto.is_empty() {
            return Self::get_one_by_id(executor, id).await;
        }

        let mut query_builder = sqlx::QueryBuilder::new("UPDATE pages SET");

        if let Some(title) = dto.title {
            query_builder.push(" title = ").push_bind(title);
        }

        query_builder
            .push(" WHERE id = ")
            .push_bind(id)
            .push(" RETURNING *")
            .build_query_as::<Page>()
            .fetch_one(executor)
            .await
    }
}

impl PostgresqlRepositoryDelete for PageRepository {
    async fn delete<'a>(
        executor: impl Executor<'a, Database = Postgres>,
        id: Uuid,
    ) -> Result<Self::Response, sqlx::Error> {
        sqlx::query_as::<_, Page>("DELETE FROM pages WHERE id = $1 RETURNING *")
            .bind(id)
            .fetch_one(executor)
            .await
    }
}

impl PageRepository {
    pub async fn get_all_in_workspace<'a>(
        executor: impl Executor<'a, Database = Postgres>,
        workspace_id: Uuid,
    ) -> Result<Vec<Page>, sqlx::Error> {
        sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE workspace_id = $1")
            .bind(workspace_id)
            .fetch_all(executor)
            .await
    }

    pub async fn get_child_pages<'a>(
        executor: impl Executor<'a, Database = Postgres>,
        page_id: Uuid,
    ) -> Result<Vec<Page>, sqlx::Error> {
        sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE parent_page_id = $1")
            .bind(page_id)
            .fetch_all(executor)
            .await
    }

    pub async fn get_page_with_content<'a>(
        executor: impl Executor<'a, Database = Postgres>,
        page_id: Uuid,
    ) -> Result<PageWithContent, sqlx::Error> {
        sqlx::query_as::<_, PageWithContent>(
            "SELECT p.*, pt.content as content FROM pages p LEFT JOIN text_page_contents pt ON p.id = pt.page_id WHERE p.id = $1",
        )
        .bind(page_id)
        .fetch_one(executor)
        .await
    }

    pub async fn update_content<'a>(
        executor: impl Executor<'a, Database = Postgres>,
        page_id: Uuid,
        content: Option<Doc>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE text_page_contents SET content = $1 WHERE page_id = $2")
            .bind(sqlx::types::Json(content))
            .bind(page_id)
            .execute(executor)
            .await?;

        Ok(())
    }
}
