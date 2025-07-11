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

pub async fn get_page_text<'a>(
    executor: &mongodb::Database,
    page_id: Uuid,
) -> Result<Option<super::model::Doc>, mongodb::error::Error> {
    let find_options = mongodb::options::FindOneOptions::builder()
        .sort(mongodb::bson::doc! { "version": -1 })
        .build();

    executor
        .collection::<super::model::Doc>(crate::shared::constants::PAGE_TEXT_COLLECTION)
        .find_one(mongodb::bson::doc! { "page_id": page_id.to_string() })
        .with_options(find_options)
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
    sqlx::query_as::<_, Page>("INSERT INTO pages (title, parent_page_id, type, workspace_id, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *")
        .bind(page.title)
        .bind(page.parent_page_id)
        .bind(page.r#type)
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
    sqlx::query_as::<_, Page>("UPDATE pages SET title = $1 WHERE id = $2 RETURNING *")
        .bind(page.title)
        .bind(id)
        .fetch_one(executor)
        .await
}

pub async fn update_page_text(
    executor: &mongodb::Database,
    text: super::model::Doc,
) -> Result<Option<super::model::Doc>, mongodb::error::Error> {
    let collection = executor
        .collection::<super::model::Doc>(crate::shared::constants::PAGE_TEXT_COLLECTION);

    let result = collection.insert_one(text).await?;

    collection
        .find_one(mongodb::bson::doc! { "_id": result.inserted_id })
        .await
}

pub async fn delete<'a>(
    executor: impl Executor<'a, Database = Postgres>,
    id: Uuid,
) -> Result<Page, sqlx::Error> {
    sqlx::query_as::<_, Page>("DELETE FROM pages WHERE id = $1 RETURNING *")
        .bind(id)
        .fetch_one(executor)
        .await
}

pub async fn delete_page_text(
    executor: &mongodb::Database,
    page_id: Uuid,
) -> Result<mongodb::results::DeleteResult, mongodb::error::Error> {
    executor
        .collection::<super::model::Doc>(crate::shared::constants::PAGE_TEXT_COLLECTION)
        .delete_many(mongodb::bson::doc! { "page_id": page_id.to_string() })
        .await
}
