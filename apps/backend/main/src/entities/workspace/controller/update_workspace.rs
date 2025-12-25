use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;
use rust_api::entities::workspace::dto::UpdateWorkspaceDto;
use uuid::Uuid;

use crate::{
    entities::workspace::dto::WorkspaceResponse,
    shared::{extractors::json::ValidatedJson, traits::ServiceUpdateMethod},
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
) -> Result<WorkspaceResponse, ErrorResponse> {
    crate::entities::workspace::WorkspaceService::update(&state, workspace_id, dto)
        .await
        .map(WorkspaceResponse::from)
}
