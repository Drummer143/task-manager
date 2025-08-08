use std::collections::HashMap;

use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use rust_api::{
    entities::page::{
        dto::{CreatePageDto, UpdatePageDto},
        model::{Doc, Page, PageType},
        PageRepository,
    },
    shared::traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
        PostgresqlRepositoryUpdate,
    },
};

use crate::{
    shared::traits::{
        ServiceBase, ServiceCreateMethod, ServiceDeleteMethod, ServiceGetOneByIdMethod,
        ServiceUpdateMethod,
    },
    types::app_state::AppState,
};

pub struct PageService;

impl ServiceBase for PageService {
    type Response = Page;
}

impl ServiceCreateMethod for PageService {
    type CreateDto = CreatePageDto;

    async fn create(
        app_state: &AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

        let doc_dto = dto.text.clone();

        let owner_id = dto.owner_id.clone();

        let page = PageRepository::create(&mut *tx, dto)
            .await
            .map_err(ErrorResponse::from);

        if let Err(e) = page {
            let _ = tx.rollback().await;
            return Err(e);
        }

        let mut page = page.unwrap();

        let page_access = rust_api::entities::page_access::PageAccessRepository::create(
            &mut *tx,
            rust_api::entities::page_access::dto::CreatePageAccessDto {
                user_id: owner_id,
                page_id: page.id,
                role: rust_api::entities::page_access::model::Role::Owner,
            },
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

            let page_text_collection = app_state
                .mongo
                .database(rust_api::shared::constants::PAGE_TEXT_COLLECTION);

            let text = PageRepository::update_page_text(&page_text_collection, doc)
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
            for status in crate::shared::constants::INIT_BOARD_STATUSES {
                let localizations = status
                    .localizations
                    .iter()
                    .map(|(k, v)| (k.to_string(), v.to_string()))
                    .collect::<HashMap<String, String>>();

                rust_api::entities::board_statuses::BoardStatusRepository::create(
                    &mut *tx,
                    rust_api::entities::board_statuses::dto::CreateBoardStatusDto {
                        page_id: page.id,
                        position: status.position,
                        // parent_status_id: None,
                        initial: Some(status.initial),
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
}

impl ServiceUpdateMethod for PageService {
    type UpdateDto = UpdatePageDto;

    async fn update(
        app_state: &AppState,
        id: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

        let doc_dto = dto.text.clone();

        let mut page = if dto.title.is_some() {
            PageRepository::update(&mut *tx, id, dto)
                .await
                .map_err(ErrorResponse::from)?
        } else {
            PageRepository::get_one_by_id(&mut *tx, id)
                .await
                .map_err(ErrorResponse::from)?
        };

        if page.r#type == PageType::Text {
            if let Some(Some(doc_dto)) = doc_dto {
                let mut doc = Doc {
                    page_id: Some(page.id.to_string()),
                    version: 1,
                    attrs: doc_dto.attrs,
                    content: doc_dto.content,
                    marks: doc_dto.marks,
                    r#type: doc_dto.r#type,
                    text: doc_dto.text,
                };

                let page_text_collection = app_state
                    .mongo
                    .database(rust_api::shared::constants::PAGE_TEXT_COLLECTION);

                let prev_doc = PageRepository::get_page_text(&page_text_collection, page.id)
                    .await
                    .map_err(ErrorResponse::from)?;

                if let Some(prev_doc) = prev_doc {
                    doc.version = prev_doc.version + 1;
                } else {
                    doc.version = 1;
                }

                let text = PageRepository::update_page_text(&page_text_collection, doc)
                    .await
                    .map_err(ErrorResponse::from);

                if let Ok(text) = text {
                    page.text = text;
                } else {
                    let _ = tx.rollback().await;
                    return Err(text.unwrap_err());
                }
            }
        }

        tx.commit().await.map_err(ErrorResponse::from)?;

        Ok(page)
    }
}

impl ServiceGetOneByIdMethod for PageService {
    async fn get_one_by_id(
        app_state: &AppState,
        id: Uuid,
    ) -> Result<Self::Response, ErrorResponse> {
        let mut page = PageRepository::get_one_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)?;

        if page.r#type == PageType::Text {
            let page_text_collection = app_state
                .mongo
                .database(rust_api::shared::constants::PAGE_TEXT_COLLECTION);

            page.text = PageRepository::get_page_text(&page_text_collection, page.id)
                .await
                .map_err(ErrorResponse::from)?;
        }

        Ok(page)
    }
}

impl ServiceDeleteMethod for PageService {
    async fn delete(app_state: &AppState, id: Uuid) -> Result<Self::Response, ErrorResponse> {
        let mut tx = app_state
            .postgres
            .begin()
            .await
            .map_err(ErrorResponse::from)?;

        let page = PageRepository::delete(&mut *tx, id)
            .await
            .map_err(ErrorResponse::from)?;

        if page.r#type == PageType::Text {
            let page_text_collection = app_state
                .mongo
                .database(rust_api::shared::constants::PAGE_TEXT_COLLECTION);

            PageRepository::delete_page_text(&page_text_collection, page.id)
                .await
                .map_err(ErrorResponse::from)?;
        }

        tx.commit().await.map_err(ErrorResponse::from)?;

        Ok(page)
    }
}

impl PageService {
    pub async fn get_all_in_workspace(
        app_state: &AppState,
        workspace_id: Uuid,
    ) -> Result<Vec<Page>, ErrorResponse> {
        PageRepository::get_all_in_workspace(&app_state.postgres, workspace_id)
            .await
            .map_err(ErrorResponse::from)
    }

    pub async fn get_child_pages(
        app_state: &AppState,
        page_id: Uuid,
    ) -> Result<Vec<Page>, ErrorResponse> {
        PageRepository::get_child_pages(&app_state.postgres, page_id)
            .await
            .map_err(ErrorResponse::from)
    }
}
