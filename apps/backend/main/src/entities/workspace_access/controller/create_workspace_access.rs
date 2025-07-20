use std::collections::HashMap;

use axum::{
    extract::{Path, State},
    Extension, Json,
};

use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::workspace_access::dto::CreateWorkspaceAccessDto,
    shared::traits::{ServiceCreateMethod, ServiceGetOneByIdMethod},
};

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
    request_body = CreateWorkspaceAccessDto,
    tags = ["Workspace Access"],
)]
pub async fn create_workspace_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_workspace_access): Extension<
        rust_api::entities::workspace_access::model::WorkspaceAccess,
    >,
    Path(workspace_id): Path<uuid::Uuid>,
    Json(dto): Json<CreateWorkspaceAccessDto>,
) -> impl axum::response::IntoResponse {
    if user_workspace_access.role < rust_api::entities::workspace_access::model::Role::Admin {
        return Err(error_handlers::handlers::ErrorResponse::forbidden(
            error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    if dto.role > rust_api::entities::workspace_access::model::Role::Admin
        && user_workspace_access.role < rust_api::entities::workspace_access::model::Role::Owner
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
                    Some(HashMap::from([(
                        "message".to_string(),
                        "User not found".to_string(),
                    )])),
                    None,
                );
            }

            e
        })?;

    let workspace_access = crate::entities::workspace_access::WorkspaceAccessService::create(
        &state,
        rust_api::entities::workspace_access::dto::CreateWorkspaceAccessDto {
            user_id: dto.user_id,
            workspace_id,
            role: dto.role,
        },
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
