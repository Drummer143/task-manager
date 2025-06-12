use axum::{
    extract::{Path, State}, Extension, Json
};
use uuid::Uuid;

use crate::shared::error_handlers::handlers::ErrorResponse;

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
    request_body = crate::entities::page_access::dto::CreatePageAccessDto,
    tags = ["Page Access"],
)]
pub async fn create_page_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(dto): Json<crate::entities::page_access::dto::CreatePageAccessDto>,
) -> impl axum::response::IntoResponse {
    let user_page_access = crate::entities::page_access::service::get_page_access(
        &state.db,
        user_id,
        page_id,
    )
    .await
    .map_err(|e| {
        if e.status_code == 404 {
            return crate::shared::error_handlers::handlers::ErrorResponse::forbidden(
                crate::shared::error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            );
        }

        e
    })?;

    if user_page_access.role < crate::entities::page_access::model::Role::Admin {
        return Err(
            crate::shared::error_handlers::handlers::ErrorResponse::forbidden(
                crate::shared::error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            ),
        );
    }

    if dto.role > crate::entities::page_access::model::Role::Admin
        && user_page_access.role < crate::entities::page_access::model::Role::Owner
    {
        return Err(
            crate::shared::error_handlers::handlers::ErrorResponse::forbidden(
                crate::shared::error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            ),
        );
    }

    let target_user = crate::entities::user::service::find_by_id(&state.db, dto.user_id)
        .await
        .map_err(|e| {
            if e.status_code == 404 {
                return crate::shared::error_handlers::handlers::ErrorResponse::not_found(
                    crate::shared::error_handlers::codes::NotFoundErrorCode::NotFound,
                    None,
                );
            }

            e
        })?;

    let page_access = crate::entities::page_access::service::create_page_access(
        &state.db,
        target_user.id,
        page_id,
        dto.role,
    )
    .await?;

    Ok(
        crate::entities::page_access::dto::PageAccessResponse {
            id: page_access.id,
            user: target_user,
            role: page_access.role,
            created_at: page_access.created_at,
            updated_at: page_access.updated_at,
            deleted_at: page_access.deleted_at,
        },
    )
}
