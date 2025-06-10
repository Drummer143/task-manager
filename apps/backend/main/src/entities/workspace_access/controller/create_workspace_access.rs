use std::str::FromStr;

use axum::{
    extract::{Path, State},
    Json,
};

use crate::shared::error_handlers::handlers::ErrorResponse;

#[utoipa::path(
    post,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access created successfully", body = crate::entities::workspace_access::dto::WorkspaceAccessResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = crate::entities::workspace_access::dto::CreateWorkspaceAccessDto,
    tags = ["Workspace Access"],
)]
pub async fn create_workspace_access(
    State(state): State<crate::types::app_state::AppState>,
    Path(workspace_id): Path<uuid::Uuid>,
    cookies: axum_extra::extract::CookieJar,
    Json(dto): Json<crate::entities::workspace_access::dto::CreateWorkspaceAccessDto>,
) -> impl axum::response::IntoResponse {
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

    if user_workspace_access.role < crate::entities::workspace_access::model::Role::Admin {
        return Err(
            crate::shared::error_handlers::handlers::ErrorResponse::forbidden(
                crate::shared::error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
                None,
            ),
        );
    }

    if dto.role > crate::entities::workspace_access::model::Role::Admin
        && user_workspace_access.role < crate::entities::workspace_access::model::Role::Owner
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

    let workspace_access = crate::entities::workspace_access::service::create_workspace_access(
        &state.db,
        target_user.id,
        workspace_id,
        dto.role,
    )
    .await?;

    Ok(
        crate::entities::workspace_access::dto::WorkspaceAccessResponse {
            id: workspace_access.id,
            user: target_user,
            role: workspace_access.role,
            created_at: workspace_access.created_at,
            updated_at: workspace_access.updated_at,
            deleted_at: workspace_access.deleted_at,
        },
    )
}
