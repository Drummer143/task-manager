use std::collections::HashMap;

use axum::{
    extract::{Path, State},
    Extension, Json,
};
use uuid::Uuid;

use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::page_access::dto::{CreatePageAccessDto, PageAccessResponse},
    shared::traits::{ServiceCreateMethod, ServiceGetOneByIdMethod},
};

#[utoipa::path(
    post,
    path = "/workspaces/{workspace_id}/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access created successfully", body = crate::entities::page_access::dto::PageAccessResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = CreatePageAccessDto,
    tags = ["Page Access"],
)]
pub async fn create_page_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(dto): Json<CreatePageAccessDto>,
) -> Result<PageAccessResponse, ErrorResponse> {
    let user_page_access =
        crate::entities::page_access::PageAccessService::get_page_access(&state, user_id, page_id)
            .await
            .map_err(|e| {
                if e.status_code == 404 {
                    return error_handlers::handlers::ErrorResponse::forbidden(
                        error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                        e.details,
                        e.dev_details,
                    );
                }

                e
            })?;

    if user_page_access.role < rust_api::entities::page_access::model::Role::Admin {
        return Err(error_handlers::handlers::ErrorResponse::forbidden(
            error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    if dto.role > rust_api::entities::page_access::model::Role::Admin
        && user_page_access.role < rust_api::entities::page_access::model::Role::Owner
    {
        return Err(error_handlers::handlers::ErrorResponse::forbidden(
            error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    let target_user = crate::entities::user::UserService::get_one_by_id(&state, dto.user_id)
        .await
        .map_err(|e| {
            if e.status_code == 404 {
                return error_handlers::handlers::ErrorResponse::not_found(
                    error_handlers::codes::NotFoundErrorCode::NotFound,
                    e.details,
                    e.dev_details,
                );
            }

            e
        })?;

    let page_access = crate::entities::page_access::PageAccessService::create(
        &state,
        rust_api::entities::page_access::dto::CreatePageAccessDto {
            user_id: target_user.id,
            page_id,
            role: dto.role,
        },
    )
    .await?;

    Ok(crate::entities::page_access::dto::PageAccessResponse {
        id: page_access.id,
        user: target_user,
        role: page_access.role,
        created_at: page_access.created_at,
        updated_at: page_access.updated_at,
        deleted_at: page_access.deleted_at,
    })
}
