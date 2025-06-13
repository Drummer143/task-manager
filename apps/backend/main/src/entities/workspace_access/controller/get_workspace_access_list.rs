use axum::{extract::{Path, State}, Extension};

use error_handlers::{codes, handlers::ErrorResponse};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access list retrieved successfully", body = crate::entities::workspace_access::dto::WorkspaceAccessResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    tags = ["Workspace Access"],
)]
pub async fn get_workspace_access_list(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    Path(workspace_id): Path<uuid::Uuid>,
) -> Result<
    axum::Json<Vec<crate::entities::workspace_access::dto::WorkspaceAccessResponse>>,
    ErrorResponse,
> {
    let user_workspace_access = crate::entities::workspace_access::service::get_workspace_access(
        &state.postgres,
        user_id,
        workspace_id,
    )
    .await
    .map_err(|e| {
        if e.status_code == 404 {
            return ErrorResponse::forbidden(
                codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            );
        }

        e
    })?;

    if user_workspace_access.role < crate::entities::workspace_access::model::Role::Member {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            None,
        ));
    }

    let workspace_access_list =
        crate::entities::workspace_access::service::get_workspace_access_list(
            &state.postgres,
            workspace_id,
        )
        .await
        .map_err(|e| {
            if e.status_code == 404 {
                return ErrorResponse::forbidden(
                    codes::ForbiddenErrorCode::InsufficientPermissions,
                    None,
                );
            }

            e
        })?;

    Ok(axum::Json(workspace_access_list))
}
