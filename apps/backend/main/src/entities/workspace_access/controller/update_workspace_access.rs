use axum::{extract::{Path, State}, Extension, Json};

use crate::entities::workspace_access::dto::WorkspaceAccessResponse;

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access updated successfully", body = crate::entities::workspace_access::dto::WorkspaceAccessResponse),
        (status = 400, description = "Invalid request", body = error_handlers::handlers::ErrorResponse),
        (status = 401, description = "Unauthorized", body = error_handlers::handlers::ErrorResponse),
        (status = 403, description = "Forbidden", body = error_handlers::handlers::ErrorResponse),
        (status = 404, description = "Not found", body = error_handlers::handlers::ErrorResponse),
        (status = 500, description = "Internal server error", body = error_handlers::handlers::ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = crate::entities::workspace_access::dto::UpdateWorkspaceAccessDto,
    tags = ["Workspace Access"],
)]
pub async fn update_workspace_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    Path(workspace_id): Path<uuid::Uuid>,
    Json(dto): Json<crate::entities::workspace_access::dto::UpdateWorkspaceAccessDto>,
) -> impl axum::response::IntoResponse {
    let user_workspace_access = crate::entities::workspace_access::service::get_workspace_access(
        &state.postgres,
        user_id,
        workspace_id,
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

    if user_workspace_access.role < crate::entities::workspace_access::model::Role::Admin {
        return Err(
            error_handlers::handlers::ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            ),
        );
    }
    
    // TODO: complete access checks

    let workspace_access = crate::entities::workspace_access::service::update_workspace_access(
        &state.postgres,
        dto.user_id,
        workspace_id,
        dto.role,
    )
    .await?;

    dbg!(&workspace_access);

    Ok(WorkspaceAccessResponse {
        id: workspace_access.id,
        user: user_workspace_access.user,
        role: workspace_access.role,
        created_at: workspace_access.created_at,
        updated_at: workspace_access.updated_at,
        deleted_at: workspace_access.deleted_at,
    })
}
