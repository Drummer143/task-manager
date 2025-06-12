use axum::{
    extract::{Path, State}, Extension, Json
};
use uuid::Uuid;

use crate::entities::page_access::dto::PageAccessResponse;

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access updated successfully", body = crate::entities::page_access::dto::PageAccessResponse),
        (status = 400, description = "Invalid request", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 401, description = "Unauthorized", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 403, description = "Forbidden", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 404, description = "Not found", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 500, description = "Internal server error", body = crate::shared::error_handlers::handlers::ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = crate::entities::page_access::dto::UpdatePageAccessDto,
    tags = ["Page Access"],
)]
pub async fn update_page_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(dto): Json<crate::entities::page_access::dto::UpdatePageAccessDto>,
) -> impl axum::response::IntoResponse {
    let user_page_access =
        crate::entities::page_access::service::get_page_access(&state.postgres, user_id, page_id)
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

    // TODO: complete access checks

    let page_access = crate::entities::page_access::service::update_page_access(
        &state.postgres,
        dto.user_id,
        page_id,
        dto.role,
    )
    .await?;

    Ok(PageAccessResponse {
        id: page_access.id,
        user: user_page_access.user,
        role: page_access.role,
        created_at: page_access.created_at,
        updated_at: page_access.updated_at,
        deleted_at: page_access.deleted_at,
    })
}
