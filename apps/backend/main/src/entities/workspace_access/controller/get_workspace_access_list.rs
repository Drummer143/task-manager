use std::str::FromStr;

use axum::extract::{Path, State};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access list retrieved successfully", body = crate::entities::workspace_access::dto::WorkspaceAccessResponse),
        (status = 400, description = "Invalid request", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 401, description = "Unauthorized", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 403, description = "Forbidden", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 404, description = "Not found", body = crate::shared::error_handlers::handlers::ErrorResponse),
        (status = 500, description = "Internal server error", body = crate::shared::error_handlers::handlers::ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    tags = ["Workspace Access"],
)]
pub async fn get_workspace_access_list(
    State(state): State<crate::types::app_state::AppState>,
    Path(workspace_id): Path<uuid::Uuid>,
    cookies: axum_extra::extract::CookieJar,
) -> Result<
    axum::Json<Vec<crate::entities::workspace_access::dto::WorkspaceAccessResponse>>,
    crate::shared::error_handlers::handlers::ErrorResponse,
> {
    let user_id = cookies.get("user_id").unwrap().value();

    let user_id = uuid::Uuid::from_str(user_id).unwrap();

    let user_workspace_access = crate::entities::workspace_access::service::get_workspace_access(
        &state.db,
        user_id,
        workspace_id,
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

    if user_workspace_access.role < crate::entities::workspace_access::model::Role::Member {
        return Err(
            crate::shared::error_handlers::handlers::ErrorResponse::forbidden(
                crate::shared::error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            ),
        );
    }

    let workspace_access_list =
        crate::entities::workspace_access::service::get_workspace_access_list(
            &state.db,
            workspace_id,
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

    Ok(axum::Json(workspace_access_list))
}
