use std::collections::HashMap;

use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use rust_api::{
    entities::page::{
        PageRepository,
        dto::CreatePageDto,
        model::{Page, PageType, PageWithContent},
    },
    shared::traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
        PostgresqlRepositoryUpdate,
    },
};

use crate::{
    entities::page::dto::UpdatePageDto,
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

        let owner_id = dto.owner_id.clone();

        let page = PageRepository::create(&mut *tx, dto)
            .await
            .map_err(ErrorResponse::from)?;

        rust_api::entities::page_access::PageAccessRepository::create(
            &mut *tx,
            rust_api::entities::page_access::dto::CreatePageAccessDto {
                user_id: owner_id,
                page_id: page.id,
                role: rust_api::entities::page_access::model::Role::Owner,
            },
        )
        .await
        .map_err(ErrorResponse::from)?;

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

        let page = if dto.title.is_some() {
            PageRepository::update(
                &mut *tx,
                id,
                rust_api::entities::page::dto::UpdatePageDto { title: dto.title },
            )
            .await
            .map_err(ErrorResponse::from)?
        } else {
            PageRepository::get_one_by_id(&app_state.postgres, id)
                .await
                .map_err(ErrorResponse::from)?
        };

        if let Some(content) = dto.content {
            PageRepository::update_content(&mut *tx, id, content)
                .await
                .map_err(ErrorResponse::from)?;
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
        PageRepository::get_one_by_id(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl ServiceDeleteMethod for PageService {
    async fn delete(app_state: &AppState, id: Uuid) -> Result<Self::Response, ErrorResponse> {
        PageRepository::delete(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }
}

impl PageService {
    pub async fn get_one_with_content_by_id(
        app_state: &AppState,
        id: Uuid,
    ) -> Result<PageWithContent, ErrorResponse> {
        PageRepository::get_page_with_content(&app_state.postgres, id)
            .await
            .map_err(ErrorResponse::from)
    }

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
