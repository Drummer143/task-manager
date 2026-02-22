use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::workspace::{WorkspaceService, dto::WorkspaceResponse},
    shared::traits::ServiceGetOneByIdMethod,
};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}",
    operation_id = "get_workspace_by_id",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
    ),
    responses(
        (status = 200, description = "Workspace found", body = WorkspaceResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"]
)]
pub async fn get_by_id(
    State(state): State<crate::types::app_state::AppState>,
    Path(workspace_id): Path<uuid::Uuid>,
) -> Result<WorkspaceResponse, ErrorResponse> {
    WorkspaceService::get_one_by_id(&state, workspace_id)
        .await
        .map(WorkspaceResponse::from)
}
