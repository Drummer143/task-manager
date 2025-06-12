use axum::extract::{Path, State};
use uuid::Uuid;

use crate::{
    entities::{
        page::dto::{ChildPageResponse, PageInclude, PageQuery, PageResponse},
        task::dto::TaskResponse,
        workspace::dto::WorkspaceResponseWithoutInclude,
    },
    shared::{error_handlers::{codes, handlers::ErrorResponse}, extractors::query::ValidatedQuery},
    types::app_state::AppState,
};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages/{page_id}",
    operation_id = "get_page",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
        ("page_id", Path, description = "Page ID"),
        ("include" = Option<Vec<PageInclude>>, Query, explode = false, description = "Include related entities"),
    ),
    responses(
        (status = 200, description = "Page details", body = PageResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Page"],
)]
pub async fn get_page(
    State(state): State<AppState>,
    ValidatedQuery(query): ValidatedQuery<PageQuery>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
) -> Result<PageResponse, ErrorResponse> {
    let page = crate::entities::page::service::get_by_id(&state.db, page_id).await?;

    let mut include_owner = false;
    let mut include_workspace = false;
    let mut include_parent_page = false;
    let mut include_child_pages = false;
    let mut include_tasks = false;

    if let Some(includes) = query.include {
        include_owner = includes.contains(&PageInclude::Owner);
        include_workspace = includes.contains(&PageInclude::Workspace);
        include_parent_page = includes.contains(&PageInclude::ParentPage);
        include_child_pages = includes.contains(&PageInclude::ChildPages);
        include_tasks = includes.contains(&PageInclude::Tasks);
    }

    let mut page_response = PageResponse::from(page.clone());

    page_response.role = Some(
        crate::entities::page_access::repository::get_page_access(
            &state.db,
            page.owner_id,
            page.id,
        )
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => {
                ErrorResponse::not_found(codes::NotFoundErrorCode::NotFound, None)
            }
            _ => ErrorResponse::internal_server_error(),
        })?
        .role,
    );

    if include_owner {
        page_response.owner = Some(
            crate::entities::user::service::find_by_id(&state.db, page.owner_id.clone()).await?,
        );
    }

    if include_workspace {
        page_response.workspace = Some(
            crate::entities::workspace::service::get_by_id(&state.db, page.workspace_id.clone())
                .await
                .map(|w| WorkspaceResponseWithoutInclude::from(w))?,
        );
    }

    if include_parent_page && page.parent_page_id.is_some() {
        page_response.parent_page = Some(
            crate::entities::page::service::get_by_id(
                &state.db,
                page.parent_page_id.unwrap().clone(),
            )
            .await
            .map(ChildPageResponse::from)?,
        );
    }

    if include_child_pages {
        page_response.child_pages = Some(
            crate::entities::page::service::get_child_pages(&state.db, page.id.clone())
                .await
                .map(|pages| pages.into_iter().map(ChildPageResponse::from).collect())?,
        );
    }

    if include_tasks {
        page_response.tasks = Some(
            crate::entities::task::service::get_all_tasks_by_page_id(&state.db, page.id.clone())
                .await
                .map(|tasks| tasks.into_iter().map(TaskResponse::from).collect())?,
        );
    }

    Ok(page_response)
}
