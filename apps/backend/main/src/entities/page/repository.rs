use sqlx::{Executor, Postgres};
use uuid::Uuid;

use super::model::Page;

pub async fn get_by_id<'a>(
    executor: impl Executor<'a, Database = Postgres>,
    id: Uuid,
) -> Result<Page, sqlx::Error> {
    sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE id = $1")
        .bind(id)
        .fetch_one(executor)
        .await
}

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

pub async fn create<'a>(
    executor: impl Executor<'a, Database = Postgres>,
    page: super::dto::CreatePageDto,
    workspace_id: Uuid,
    owner_id: Uuid,
) -> Result<Page, sqlx::Error> {
    sqlx::query_as::<_, Page>("INSERT INTO pages (title, parent_page_id, type, text, workspace_id, owner_id) VALUES ($1, $2, $3, $4, $5, $6)")
        .bind(page.title)
        .bind(page.parent_page_id)
        .bind(page.r#type)
        .bind(page.text)
        .bind(workspace_id)
        .bind(owner_id)
        .fetch_one(executor)
        .await
}

pub async fn update<'a>(
    executor: impl Executor<'a, Database = Postgres>,
    id: Uuid,
    page: super::dto::UpdatePageDto,
) -> Result<Page, sqlx::Error> {
    sqlx::query_as::<_, Page>("UPDATE pages SET title = $1, text = $2 WHERE id = $3")
        .bind(page.title)
        .bind(page.text)
        .bind(id)
        .fetch_one(executor)
        .await
}

pub async fn delete<'a>(
    executor: impl Executor<'a, Database = Postgres>,
    id: Uuid,
) -> Result<Page, sqlx::Error> {
    sqlx::query_as::<_, Page>("DELETE FROM pages WHERE id = $1")
        .bind(id)
        .fetch_one(executor)
        .await
}
