use std::collections::HashMap;

use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use sql::{
    entities::page::{
        PageRepository,
        dto::{CreatePageAccessDto, CreatePageDto, UpdatePageAccessDto},
        model::{Page, PageAccess, PageType, PageWithContent},
    },
    shared::traits::{
        PostgresqlRepositoryCreate, PostgresqlRepositoryDelete, PostgresqlRepositoryGetOneById,
        PostgresqlRepositoryUpdate,
    },
};

use crate::{
    entities::page::dto::{PageAccessResponse, UpdatePageDto},
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

        let page = PageRepository::create(&mut *tx, dto)
            .await
            .map_err(ErrorResponse::from)?;

        if page.r#type == PageType::Board {
            for status in crate::shared::constants::INIT_BOARD_STATUSES {
                let localizations = status
                    .localizations
                    .iter()
                    .map(|(k, v)| (k.to_string(), v.to_string()))
                    .collect::<HashMap<String, String>>();

                sql::entities::board_statuses::BoardStatusRepository::create(
                    &mut *tx,
                    sql::entities::board_statuses::dto::CreateBoardStatusDto {
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
                sql::entities::page::dto::UpdatePageDto { title: dto.title },
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

    // PAGE ACCESS

    pub async fn create_page_access(
        app_state: &crate::types::app_state::AppState,
        dto: CreatePageAccessDto,
    ) -> Result<PageAccess, ErrorResponse> {
        sql::entities::page::PageRepository::create_page_access(&app_state.postgres, dto)
            .await
            .map_err(|e| match e {
                sqlx::Error::Database(e) => {
                    if e.code() == Some("23505".into()) {
                        return ErrorResponse::conflict(
                            error_handlers::codes::ConflictErrorCode::AccessAlreadyGiven,
                            None,
                            Some(e.to_string()),
                        );
                    }

                    ErrorResponse::internal_server_error(None)
                }
                _ => ErrorResponse::internal_server_error(None),
            })
    }

    pub async fn update_page_access(
        app_state: &crate::types::app_state::AppState,
        dto: UpdatePageAccessDto,
    ) -> Result<PageAccess, ErrorResponse> {
        sql::entities::page::PageRepository::update_page_access(&app_state.postgres, dto)
            .await
            .map_err(|e| match e {
                sqlx::Error::RowNotFound => ErrorResponse::not_found(
                    error_handlers::codes::NotFoundErrorCode::NotFound,
                    None,
                    Some(e.to_string()),
                ),
                error => ErrorResponse::internal_server_error(Some(error.to_string())),
            })
    }
    pub async fn get_page_access<'a>(
        app_state: &crate::types::app_state::AppState,
        user_id: Uuid,
        page_id: Uuid,
    ) -> Result<PageAccessResponse, ErrorResponse> {
        let page_access = sql::entities::page::PageRepository::get_one_page_access(
            &app_state.postgres,
            user_id,
            page_id,
        )
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => ErrorResponse::not_found(
                error_handlers::codes::NotFoundErrorCode::NotFound,
                None,
                Some(e.to_string()),
            ),
            error => ErrorResponse::internal_server_error(Some(error.to_string())),
        })?;

        let user =
            crate::entities::user::UserService::get_one_by_id(&app_state, page_access.user_id)
                .await?;

        Ok(PageAccessResponse {
            created_at: page_access.created_at,
            updated_at: page_access.updated_at,
            deleted_at: page_access.deleted_at,
            id: page_access.id,
            user,
            role: page_access.role,
        })
    }

    pub async fn get_page_access_list<'a>(
        app_state: &crate::types::app_state::AppState,
        page_id: Uuid,
    ) -> Result<Vec<PageAccessResponse>, ErrorResponse> {
        let page_access_list = sql::entities::page::PageRepository::get_page_access_list(
            &app_state.postgres,
            page_id,
        )
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => ErrorResponse::not_found(
                error_handlers::codes::NotFoundErrorCode::NotFound,
                None,
                Some(e.to_string()),
            ),
            error => ErrorResponse::internal_server_error(Some(error.to_string())),
        })?;

        let mut page_access_list_response = Vec::new();

        for page_access in page_access_list {
            let user =
                crate::entities::user::UserService::get_one_by_id(&app_state, page_access.user_id)
                    .await?;
            page_access_list_response.push(PageAccessResponse {
                created_at: page_access.created_at,
                updated_at: page_access.updated_at,
                deleted_at: page_access.deleted_at,
                id: page_access.id,
                user,
                role: page_access.role,
            });
        }

        Ok(page_access_list_response)
    }
}
