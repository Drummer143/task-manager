use axum::{
    extract::{Path, State},
    Extension,
};
use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::{
        page::dto::PageResponseWithoutInclude,
        workspace::dto::{Include, WorkspaceResponse},
    },
    shared::{extractors::query::ValidatedQuery, traits::ServiceGetOneByIdMethod},
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
    Extension(user_id): Extension<uuid::Uuid>,
    Path(workspace_id): Path<uuid::Uuid>,
    ValidatedQuery(query): ValidatedQuery<crate::entities::workspace::dto::GetWorkspaceQuery>,
) -> Result<WorkspaceResponse, ErrorResponse> {
    let include = query.include.unwrap_or_default();

    let workspace =
        crate::entities::workspace::WorkspaceService::get_one_by_id(&state, workspace_id).await?;

    let owner = if include.contains(&Include::Owner) {
        Some(
            rust_api::entities::user::repository::find_by_id(
                &state.postgres,
                workspace.workspace.owner_id,
            )
            .await
            .map_err(ErrorResponse::from)?,
        )
    } else {
        None
    };

    let pages = if include.contains(&Include::Pages) {
        Some(
            crate::entities::page::PageService::get_all_in_workspace(&state, workspace_id)
                .await
                .map_err(ErrorResponse::from)?
                .iter()
                .map(PageResponseWithoutInclude::from)
                .collect(),
        )
    } else {
        None
    };

    let role = rust_api::entities::workspace_access::repository::get_workspace_access(
        &state.postgres,
        user_id,
        workspace_id,
    )
    .await
    .map_err(ErrorResponse::from)?
    .role;

    let mut workspace_response = WorkspaceResponse::from(workspace);

    workspace_response.owner = owner;
    workspace_response.pages = pages;
    workspace_response.role = Some(role);

    Ok(workspace_response)
}
