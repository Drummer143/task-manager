use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::entities::page_access::dto::PageAccessResponse;

use rust_api::entities::page_access::model::PageAccess;

pub async fn get_page_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Copy,
    user_id: Uuid,
    page_id: Uuid,
) -> Result<PageAccessResponse, ErrorResponse> {
    let page_access =
        rust_api::entities::page_access::repository::get_page_access(executor, user_id, page_id)
            .await
            .map_err(|e| match e {
                sqlx::Error::RowNotFound => {
                    ErrorResponse::not_found(codes::NotFoundErrorCode::NotFound, None)
                }
                _ => ErrorResponse::internal_server_error(None),
            })?;

    let user = crate::entities::user::service::find_by_id(executor, page_access.user_id).await?;

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
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres> + Copy,
    page_id: Uuid,
) -> Result<Vec<PageAccessResponse>, ErrorResponse> {
    let page_access_list =
        rust_api::entities::page_access::repository::get_page_access_list(executor, page_id)
            .await
            .map_err(|e| match e {
                sqlx::Error::RowNotFound => {
                    ErrorResponse::not_found(codes::NotFoundErrorCode::NotFound, None)
                }
                _ => ErrorResponse::internal_server_error(None),
            })?;

    let mut page_access_list_response = Vec::new();

    for page_access in page_access_list {
        let user =
            crate::entities::user::service::find_by_id(executor, page_access.user_id).await?;
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

pub async fn create_page_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    page_id: Uuid,
    role: rust_api::entities::page_access::model::Role,
) -> Result<PageAccess, ErrorResponse> {
    rust_api::entities::page_access::repository::create_page_access(executor, user_id, page_id, role)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(e) => {
                if e.code() == Some("23505".into()) {
                    return ErrorResponse::bad_request(
                        codes::BadRequestErrorCode::AccessAlreadyGiven,
                        None,
                    );
                }

                ErrorResponse::internal_server_error(None)
            }
            _ => ErrorResponse::internal_server_error(None),
        })
}

pub async fn update_page_access<'a>(
    executor: impl sqlx::Executor<'a, Database = sqlx::Postgres>,
    user_id: Uuid,
    page_id: Uuid,
    role: Option<rust_api::entities::page_access::model::Role>,
) -> Result<PageAccess, ErrorResponse> {
    rust_api::entities::page_access::repository::update_page_access(executor, user_id, page_id, role)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => {
                ErrorResponse::not_found(codes::NotFoundErrorCode::NotFound, None)
            }
            _ => ErrorResponse::internal_server_error(None),
        })
}
