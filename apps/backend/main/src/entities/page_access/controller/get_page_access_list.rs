use axum::{extract::{Path, State}, Extension};
use uuid::Uuid;

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access list retrieved successfully", body = crate::entities::page_access::dto::PageAccessResponse),
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
    tags = ["Page Access"],
)]
pub async fn get_page_access_list(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
) -> Result<
    axum::Json<Vec<crate::entities::page_access::dto::PageAccessResponse>>,
    crate::shared::error_handlers::handlers::ErrorResponse,
> {
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

    if user_page_access.role < crate::entities::page_access::model::Role::Member {
        return Err(
            crate::shared::error_handlers::handlers::ErrorResponse::forbidden(
                crate::shared::error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            ),
        );
    }

    let page_access_list =
        crate::entities::page_access::service::get_page_access_list(
            &state.db,
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

    Ok(axum::Json(page_access_list))
}
