use std::collections::HashMap;

use axum::{
    Extension, Json,
    extract::{Path, State},
};

use error_handlers::{codes, handlers::ErrorResponse};
use sql::workspace::model::WorkspaceAccess;
use uuid::Uuid;

use crate::{
    controllers::workspace::dto::{CreateWorkspaceAccessRequest, WorkspaceAccessResponse},
    repos::workspaces::CreateWorkspaceAccessDto,
    services::{users::UserService, workspaces::WorkspaceService},
    shared::extractors::json::ValidatedJson,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access created successfully", body = WorkspaceAccessResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = CreateWorkspaceAccessRequest,
    tags = ["Workspace Access"],
)]
pub async fn create_workspace_access(
    State(state): State<AppState>,
    Extension(user_workspace_access): Extension<WorkspaceAccess>,
    Path(workspace_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<CreateWorkspaceAccessRequest>,
) -> Result<Json<WorkspaceAccessResponse>, ErrorResponse> {
    if user_workspace_access.role < sql::workspace::model::Role::Admin {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    if dto.role > sql::workspace::model::Role::Admin
        && user_workspace_access.role < sql::workspace::model::Role::Owner
    {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    let target_user = UserService::get_one_by_id(&state.postgres, dto.user_id)
        .await
        .map_err(|e| {
            if e.status_code == 404 {
                return ErrorResponse::not_found(
                    codes::NotFoundErrorCode::NotFound,
                    Some(HashMap::from([(
                        "message".to_string(),
                        "User not found".to_string(),
                    )])),
                    None,
                );
            }

            e
        })?;

    let workspace_access = WorkspaceService::create_workspace_access(
        &state.postgres,
        CreateWorkspaceAccessDto {
            user_id: dto.user_id,
            workspace_id,
            role: dto.role,
        },
    )
    .await?;

    Ok(Json(WorkspaceAccessResponse {
        id: workspace_access.id,
        user: target_user,
        role: workspace_access.role,
        created_at: workspace_access.created_at,
        updated_at: workspace_access.updated_at,
        deleted_at: workspace_access.deleted_at,
    }))
}
