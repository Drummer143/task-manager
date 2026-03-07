use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    controllers::workspace::dto::WorkspaceResponse, repos::workspaces::UpdateWorkspaceDto, services::workspaces::WorkspaceService, shared::extractors::json::ValidatedJson
};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}",
    responses(
        (status = 200, description = "Workspace updated successfully", body = WorkspaceResponse),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
    ),
    request_body = UpdateWorkspaceDto,
    tags = ["Workspace"],
)]
#[axum_macros::debug_handler]
pub async fn update_workspace(
    State(state): State<crate::types::app_state::AppState>,
    Path(workspace_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<UpdateWorkspaceDto>,
) -> Result<Json<WorkspaceResponse>, ErrorResponse> {
    WorkspaceService::update(&state.postgres, workspace_id, dto)
        .await
        .map(|w| Json(WorkspaceResponse::from(w)))
}
