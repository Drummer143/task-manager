use crate::{
    entities::workspace::{dto::DetailedWorkspaceResponse, service::WorkspaceService},
    types::app_state::AppState,
};
use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::workspace::model::WorkspaceAccess;

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/detailed",
    operation_id = "get_detailed_workspace",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
    ),
    responses(
        (status = 200, description = "Workspace found", body = DetailedWorkspaceResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"]
)]
pub async fn get_detailed_workspace(
    State(app_state): State<AppState>,
    Extension(workspace_access): Extension<WorkspaceAccess>,
) -> Result<Json<DetailedWorkspaceResponse>, ErrorResponse> {
    WorkspaceService::get_detailed_workspace(&app_state, workspace_access)
        .await
        .map(Json)
}
