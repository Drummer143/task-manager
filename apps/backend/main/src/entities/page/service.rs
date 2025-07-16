use std::collections::HashMap;

use error_handlers::handlers::ErrorResponse;
use sqlx::PgPool;
use uuid::Uuid;

use rust_api::entities::page::{
    dto::{CreatePageDto, UpdatePageDto},
    model::{Doc, Page, PageType},
    repository,
};

use crate::shared::constants::INIT_BOARD_STATUSES;

pub async fn get_by_id(
    postgres: &PgPool,
    mongodb: &mongodb::Database,
    id: Uuid,
) -> Result<Page, ErrorResponse> {
    let mut page = repository::get_by_id(postgres, id)
        .await
        .map_err(ErrorResponse::from)?;

    if page.r#type == PageType::Text {
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
    dto: CreatePageDto,
    workspace_id: Uuid,
    owner_id: Uuid,
) -> Result<Page, ErrorResponse> {
    let mut tx = db.begin().await.map_err(ErrorResponse::from)?;

    let doc_dto = dto.text.clone();

    let page = repository::create(&mut *tx, dto, workspace_id, owner_id)
        .await
        .map_err(ErrorResponse::from);

    if let Err(e) = page {
        let _ = tx.rollback().await;
        return Err(e);
    }

    let mut page = page.unwrap();

    let page_access = crate::entities::page_access::service::create_page_access(
        &mut *tx,
        owner_id,
        page.id,
        rust_api::entities::page_access::model::Role::Owner,
    )
    .await
    .map_err(ErrorResponse::from);

    if let Err(e) = page_access {
        let _ = tx.rollback().await;
        return Err(e);
    }

    if page.r#type == PageType::Text && doc_dto.is_some() {
        let doc_dto = doc_dto.unwrap();
        let doc = Doc {
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
            let _ = tx.rollback().await;
            return Err(text.unwrap_err());
        }
    }

    if page.r#type == PageType::Board {
        for status in INIT_BOARD_STATUSES {
            let localizations = status
                .localizations
                .iter()
                .map(|(k, v)| (k.to_string(), v.to_string()))
                .collect::<HashMap<String, String>>();

            rust_api::entities::board_statuses::repository::create_board_status(
                &mut *tx,
                rust_api::entities::board_statuses::dto::CreateBoardStatusDto {
                    page_id: page.id,
                    code: status.code.to_string(),
                    position: status.position,
                    parent_status_id: None,
                    initial: Some(status.initial),
                    r#type: status.r#type,
                    localizations: sqlx::types::Json(localizations),
                },
            )
            .await
            .map_err(ErrorResponse::from)?;
        }
    }

    tx.commit().await.map_err(ErrorResponse::from)?;

    Ok(page)
}

pub async fn update(
    db: &PgPool,
    mongodb: &mongodb::Database,
    id: Uuid,
    page: UpdatePageDto,
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

    println!(
        "page type: {}. doc_dto.is_some(): {}",
        page.r#type,
        doc_dto.is_some()
    );

    if page.r#type == PageType::Text && doc_dto.is_some() {
        let doc_dto = doc_dto.unwrap();
        let mut doc = Doc {
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
            let _ = tx.rollback().await;
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

    if page.r#type == PageType::Text {
        repository::delete_page_text(mongodb, page.id)
            .await
            .map_err(ErrorResponse::from)?;
    }

    tx.commit().await.map_err(ErrorResponse::from)?;

    Ok(page)
}
