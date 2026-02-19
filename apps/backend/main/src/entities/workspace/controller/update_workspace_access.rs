use std::collections::HashMap;

use axum::{
    Extension,
    extract::{Path, State},
};
use uuid::Uuid;

use crate::{
    entities::workspace::dto::{UpdateWorkspaceAccessDto, WorkspaceAccessResponse},
    shared::{extractors::json::ValidatedJson, traits::ServiceGetOneByIdMethod},
};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access updated successfully", body = crate::entities::workspace::dto::WorkspaceAccessResponse),
        (status = 400, description = "Invalid request", body = error_handlers::handlers::ErrorResponse),
        (status = 401, description = "Unauthorized", body = error_handlers::handlers::ErrorResponse),
        (status = 403, description = "Forbidden", body = error_handlers::handlers::ErrorResponse),
        (status = 404, description = "Not found", body = error_handlers::handlers::ErrorResponse),
        (status = 500, description = "Internal server error", body = error_handlers::handlers::ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = UpdateWorkspaceAccessDto,
    tags = ["Workspace Access"],
)]
pub async fn update_workspace_access(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(workspace_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<UpdateWorkspaceAccessDto>,
) -> impl axum::response::IntoResponse {
    let user_workspace_access = crate::entities::workspace::WorkspaceService::get_workspace_access(
        &state,
        user_id,
        workspace_id,
    )
    .await
    .map_err(|e| {
        if e.status_code == 404 {
            return error_handlers::handlers::ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
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
        return Err(error_handlers::handlers::ErrorResponse::forbidden(
            error_handlers::codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    // TODO: complete access checks

    let workspace_access = crate::entities::workspace::WorkspaceService::update_workspace_access(
        &state,
        crate::entities::workspace::db::UpdateWorkspaceAccessDto {
            user_id: dto.user_id,
            workspace_id,
            role: dto.role,
        },
    )
    .await?;

    Ok(WorkspaceAccessResponse {
        id: workspace_access.id,
        user: crate::entities::user::UserService::get_one_by_id(&state, dto.user_id).await?,
        role: workspace_access.role,
        created_at: workspace_access.created_at,
        updated_at: workspace_access.updated_at,
        deleted_at: workspace_access.deleted_at,
    })
}
