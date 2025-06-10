use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    entities::page::{model::Page, repository},
    shared::error_handlers::handlers::ErrorResponse,
};

pub async fn get_by_id(db: &PgPool, id: Uuid) -> Result<Page, ErrorResponse> {
    repository::get_by_id(db, id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_all_in_workspace(
    db: &PgPool,
    workspace_id: Uuid,
) -> Result<Vec<Page>, ErrorResponse> {
    repository::get_all_in_workspace(db, workspace_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn get_child_pages(db: &PgPool, page_id: Uuid) -> Result<Vec<Page>, ErrorResponse> {
    repository::get_child_pages(db, page_id)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn create(
    db: &PgPool,
    page: super::dto::CreatePageDto,
    workspace_id: Uuid,
    owner_id: Uuid,
) -> Result<Page, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let page = repository::create(&mut *tx, page, workspace_id, owner_id)
        .await
        .map_err(ErrorResponse::from)?;

    // use crate::entities::page_access;

    // page_access::service::create_page_access(
    //     &mut *tx,
    //     page.id,
    //     owner_id,
    //     page_access::model::Role::Owner,
    // )
    // .await
    // .map_err(ErrorResponse::from)?;

    tx.commit().await.map_err(ErrorResponse::from)?;

    Ok(page)
}

pub async fn update(
    db: &PgPool,
    id: Uuid,
    page: super::dto::UpdatePageDto,
) -> Result<Page, ErrorResponse> {
    repository::update(db, id, page)
        .await
        .map_err(ErrorResponse::from)
}

pub async fn delete(db: &PgPool, id: Uuid) -> Result<Page, ErrorResponse> {
    repository::delete(db, id)
        .await
        .map_err(ErrorResponse::from)
}
