use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::{
    entities::page_access::dto::PageAccessResponse,
    shared::traits::{ServiceBase, ServiceCreateMethod, ServiceGetOneByIdMethod, ServiceUpdateMethod},
};

use rust_api::entities::page_access::model::PageAccess;

pub struct PageAccessService;

impl ServiceBase for PageAccessService {
    type Response = PageAccess;
}

impl ServiceCreateMethod for PageAccessService {
    type CreateDto = rust_api::entities::page_access::dto::CreatePageAccessDto;

    async fn create(
        app_state: &crate::types::app_state::AppState,
        dto: Self::CreateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        rust_api::entities::page_access::repository::create_page_access(&app_state.postgres, dto)
            .await
            .map_err(|e| match e {
                sqlx::Error::Database(e) => {
                    if e.code() == Some("23505".into()) {
                        return ErrorResponse::conflict(
                            codes::ConflictErrorCode::AccessAlreadyGiven,
                            None,
                            Some(e.to_string()),
                        );
                    }

                    ErrorResponse::internal_server_error(None)
                }
                _ => ErrorResponse::internal_server_error(None),
            })
    }
}

impl ServiceUpdateMethod for PageAccessService {
    type UpdateDto = rust_api::entities::page_access::dto::UpdatePageAccessDto;

    async fn update(
        app_state: &crate::types::app_state::AppState,
        _: Uuid,
        dto: Self::UpdateDto,
    ) -> Result<Self::Response, ErrorResponse> {
        rust_api::entities::page_access::repository::update_page_access(&app_state.postgres, dto)
            .await
            .map_err(|e| match e {
                sqlx::Error::RowNotFound => ErrorResponse::not_found(
                    codes::NotFoundErrorCode::NotFound,
                    None,
                    Some(e.to_string()),
                ),
                error => ErrorResponse::internal_server_error(Some(error.to_string())),
            })
    }
}

impl PageAccessService {
    pub async fn get_page_access<'a>(
        app_state: &crate::types::app_state::AppState,
        user_id: Uuid,
        page_id: Uuid,
    ) -> Result<PageAccessResponse, ErrorResponse> {
        let page_access = rust_api::entities::page_access::repository::get_page_access(
            &app_state.postgres,
            user_id,
            page_id,
        )
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => ErrorResponse::not_found(
                codes::NotFoundErrorCode::NotFound,
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
        let page_access_list = rust_api::entities::page_access::repository::get_page_access_list(
            &app_state.postgres,
            page_id,
        )
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => ErrorResponse::not_found(
                codes::NotFoundErrorCode::NotFound,
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
