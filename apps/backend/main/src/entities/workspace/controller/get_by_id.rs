use axum::extract::{Path, State};

use crate::{
    entities::{
        page::dto::PageResponseWithoutInclude,
        workspace::dto::{Include, WorkspaceResponse},
    },
    shared::{error_handlers::handlers::ErrorResponse, extractors::query::ValidatedQuery},
};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}",
    operation_id = "get_workspace_by_id",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
        ("include" = Option<Vec<Include>>, Query, description = "Include related entities"),
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
    ValidatedQuery(query): ValidatedQuery<crate::entities::workspace::dto::GetWorkspaceQuery>,
) -> Result<WorkspaceResponse, ErrorResponse> {
    let include = query.include.unwrap_or_default();

    let workspace = crate::entities::workspace::service::get_by_id(&state.db, workspace_id).await?;

    let owner = if include.contains(&Include::Owner) {
        Some(
            crate::entities::user::repository::find_by_id(&state.db, workspace.owner_id)
                .await
                .map_err(ErrorResponse::from)?,
        )
    } else {
        None
    };

    let pages = if include.contains(&Include::Pages) {
        Some(
            crate::entities::page::service::get_all_in_workspace(&state.db, workspace_id)
                .await
                .map_err(ErrorResponse::from)?
                .iter()
                .map(PageResponseWithoutInclude::from)
                .collect(),
        )
    } else {
        None
    };

    let mut workspace_response = WorkspaceResponse::from(workspace);

    workspace_response.owner = owner;
    workspace_response.pages = pages;

    Ok(workspace_response)
}
