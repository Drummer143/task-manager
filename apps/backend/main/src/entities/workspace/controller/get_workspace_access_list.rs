use std::collections::HashMap;

use axum::{
    Extension, Json, extract::{Path, State}
};

use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::{entities::workspace::{WorkspaceService, dto::WorkspaceAccessResponse}, types::app_state::AppState};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/access",
    responses(
        (status = 200, description = "Workspace access list retrieved successfully", body = Vec<WorkspaceAccessResponse>),
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
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(workspace_id): Path<Uuid>,
) -> Result<
    Json<Vec<WorkspaceAccessResponse>>,
    ErrorResponse,
> {
    let user_workspace_access =
        WorkspaceService::get_workspace_access(
            &state,
            user_id,
            workspace_id,
        )
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

    if user_workspace_access.role < sql::workspace::model::Role::Member {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            Some(HashMap::from([(
                "message".to_string(),
                "Insufficient permissions".to_string(),
            )])),
            None,
        ));
    }

    let workspace_access_list =
        WorkspaceService::get_workspace_access_list(
            &state,
            workspace_id,
        )
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

    Ok(Json(workspace_access_list))
}
