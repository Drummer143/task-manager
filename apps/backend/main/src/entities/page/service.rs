use error_handlers::handlers::ErrorResponse;
use sqlx::PgPool;
use uuid::Uuid;

use crate::entities::page::{model::Page, repository};

pub async fn get_by_id(
    postgres: &PgPool,
    mongodb: &mongodb::Database,
    id: Uuid,
) -> Result<Page, ErrorResponse> {
    let mut page = repository::get_by_id(postgres, id)
        .await
        .map_err(ErrorResponse::from)?;

    if page.r#type == super::model::PageType::Text {
        page.text = repository::get_page_text(mongodb, page.id)
            .await
            .map_err(ErrorResponse::from)?;
    }

    Ok(page)
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
    mongodb: &mongodb::Database,
    dto: super::dto::CreatePageDto,
    workspace_id: Uuid,
    owner_id: Uuid,
) -> Result<Page, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let doc_dto = dto.text.clone();

    let mut page = repository::create(&mut *tx, dto, workspace_id, owner_id)
        .await
        .map_err(ErrorResponse::from)?;

    if page.r#type == super::model::PageType::Text && doc_dto.is_some() {
        let doc_dto = doc_dto.unwrap();
        let doc = super::model::Doc {
            page_id: Some(page.id.to_string()),
            version: 1,
            attrs: doc_dto.attrs,
            content: doc_dto.content,
            marks: doc_dto.marks,
            r#type: doc_dto.r#type,
            text: doc_dto.text,
        };

        let text = repository::update_page_text(&mongodb, doc)
            .await
            .map_err(ErrorResponse::from);

        if let Ok(text) = text {
            page.text = text;
        } else {
            tx.rollback().await.map_err(ErrorResponse::from)?;
            return Err(text.unwrap_err());
        }
    }

    tx.commit().await.map_err(ErrorResponse::from)?;

    Ok(page)
}

pub async fn update(
    db: &PgPool,
    mongodb: &mongodb::Database,
    id: Uuid,
    page: super::dto::UpdatePageDto,
) -> Result<Page, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let doc_dto = page.text.clone();

    let mut page = if page.title.is_some() {
        repository::update(&mut *tx, id, page)
            .await
            .map_err(ErrorResponse::from)?
    } else {
        repository::get_by_id(&mut *tx, id)
            .await
            .map_err(ErrorResponse::from)?
    };

    if page.r#type == super::model::PageType::Text && doc_dto.is_some() {
        let doc_dto = doc_dto.unwrap();
        let mut doc = super::model::Doc {
            page_id: Some(page.id.to_string()),
            version: 1,
            attrs: doc_dto.attrs,
            content: doc_dto.content,
            marks: doc_dto.marks,
            r#type: doc_dto.r#type,
            text: doc_dto.text,
        };

        let prev_doc = repository::get_page_text(mongodb, page.id)
            .await
            .map_err(ErrorResponse::from)?;

        if let Some(prev_doc) = prev_doc {
            doc.version = prev_doc.version + 1;
        } else {
            doc.version = 1;
        }

        let text = repository::update_page_text(&mongodb, doc)
            .await
            .map_err(ErrorResponse::from);

        if let Ok(text) = text {
            page.text = text;
        } else {
            tx.rollback().await.map_err(ErrorResponse::from)?;
            return Err(text.unwrap_err());
        }
    }

    tx.commit().await.map_err(ErrorResponse::from)?;

    Ok(page)
}

pub async fn delete(
    db: &PgPool,
    mongodb: &mongodb::Database,
    id: Uuid,
) -> Result<Page, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let page = repository::delete(&mut *tx, id)
        .await
        .map_err(ErrorResponse::from)?;

    if page.r#type == super::model::PageType::Text {
        repository::delete_page_text(mongodb, page.id)
            .await
            .map_err(ErrorResponse::from)?;
    }

    tx.commit().await.map_err(ErrorResponse::from)?;

    Ok(page)
}
