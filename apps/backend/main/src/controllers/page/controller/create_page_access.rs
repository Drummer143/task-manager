use std::collections::HashMap;

use axum::{Extension, Json, extract::State};
use sql::page::model::PageAccess;

use error_handlers::{codes, handlers::ErrorResponse};

use crate::{
    controllers::page::dto::{CreatePageAccessRequest, PageAccessResponse}, repos::pages::CreatePageAccessDto, services::{pages::PageService, users::UserService}, shared::extractors::json::ValidatedJson, types::app_state::AppState
};

#[utoipa::path(
    post,
    path = "/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access created successfully", body = crate::controllers::page::dto::PageAccessResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = CreatePageAccessRequest,
    tags = ["Page Access"],
)]
pub async fn create_page_access(
    State(state): State<AppState>,
    Extension(user_page_access): Extension<PageAccess>,
    ValidatedJson(dto): ValidatedJson<CreatePageAccessRequest>,
) -> Result<Json<PageAccessResponse>, ErrorResponse> {
    if user_page_access.role < sql::page::model::Role::Admin {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    if dto.role > sql::page::model::Role::Admin
        && user_page_access.role < sql::page::model::Role::Owner
    {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    let target_user = UserService::get_one_by_id(&state.postgres, dto.user_id)
        .await
        .map_err(|e| {
            if e.status_code == 404 {
                return ErrorResponse::not_found(
                    codes::NotFoundErrorCode::NotFound,
                    e.details,
                    e.dev_details,
                );
            }

            e
        })?;

    let page_access = PageService::create_page_access(
        &state.postgres,
        CreatePageAccessDto {
            user_id: target_user.id,
            page_id: user_page_access.page_id,
            role: dto.role,
        },
    )
    .await?;

    Ok(Json(PageAccessResponse {
        id: page_access.id,
        user: target_user,
        role: page_access.role,
        created_at: page_access.created_at,
        updated_at: page_access.updated_at,
        deleted_at: page_access.deleted_at,
    }))
}
