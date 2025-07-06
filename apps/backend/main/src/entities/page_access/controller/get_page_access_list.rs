use axum::{extract::{Path, State}, Extension};
use uuid::Uuid;

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages/{page_id}/access",
    responses(
        (status = 200, description = "Page access list retrieved successfully", body = crate::entities::page_access::dto::PageAccessResponse),
        (status = 400, description = "Invalid request", body = error_handlers::handlers::ErrorResponse),
        (status = 401, description = "Unauthorized", body = error_handlers::handlers::ErrorResponse),
        (status = 403, description = "Forbidden", body = error_handlers::handlers::ErrorResponse),
        (status = 404, description = "Not found", body = error_handlers::handlers::ErrorResponse),
        (status = 500, description = "Internal server error", body = error_handlers::handlers::ErrorResponse),
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
    error_handlers::handlers::ErrorResponse,
> {
    let user_page_access = crate::entities::page_access::service::get_page_access(
        &state.postgres,
        user_id,
        page_id,
    )
    .await
    .map_err(|e| {
        if e.status_code == 404 {
            return error_handlers::handlers::ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            );
        }

        e
    })?;

    if user_page_access.role < repo::entities::page_access::model::Role::Member {
        return Err(
            error_handlers::handlers::ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            ),
        );
    }

    let page_access_list =
        crate::entities::page_access::service::get_page_access_list(
            &state.postgres,
            page_id,
        )
        .await
        .map_err(|e| {
            if e.status_code == 404 {
                return error_handlers::handlers::ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            );
            }

            e
        })?;

    Ok(axum::Json(page_access_list))
}
