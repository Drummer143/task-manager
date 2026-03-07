use std::collections::HashMap;

use axum::{
    Extension, Json,
    extract::{Path, State},
};
use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::{
    controllers::workspace::dto::{UpdateWorkspaceAccessRequest, WorkspaceAccessResponse},
    repos::workspaces::UpdateWorkspaceAccessDto,
    services::{users::UserService, workspaces::WorkspaceService},
    shared::extractors::json::ValidatedJson,
    types::app_state::AppState,
};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access updated successfully", body = WorkspaceAccessResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Forbidden", body = ErrorResponse),
        (status = 404, description = "Not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = UpdateWorkspaceAccessRequest,
    tags = ["Workspace Access"],
)]
pub async fn update_workspace_access(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(workspace_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<UpdateWorkspaceAccessRequest>,
) -> Result<Json<WorkspaceAccessResponse>, ErrorResponse> {
    let user_workspace_access =
        WorkspaceService::get_workspace_access(&state.postgres, user_id, workspace_id)
            .await
            .map_err(|e| {
                if e.status_code == 404 {
                    return ErrorResponse::forbidden(
                        codes::ForbiddenErrorCode::InsufficientPermissions,
                        Some(HashMap::from([(
                            "message".to_string(),
                            "Insufficient permissions".to_string(),
                        )])),
                        None,
                    );
                }

                e
            })?;

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

    // TODO: complete access checks

    let workspace_access = WorkspaceService::update_workspace_access(
        &state.postgres,
        UpdateWorkspaceAccessDto {
            user_id: dto.user_id,
            workspace_id,
            role: dto.role,
        },
    )
    .await?;

    Ok(Json(WorkspaceAccessResponse {
        id: workspace_access.id,
        user: UserService::get_one_by_id(&state.postgres, dto.user_id).await?,
        role: workspace_access.role,
        created_at: workspace_access.created_at,
        updated_at: workspace_access.updated_at,
        deleted_at: workspace_access.deleted_at,
    }))
}
