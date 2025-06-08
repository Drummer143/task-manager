use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::{
    entities::{
        page::{dto::{
            ChildPageResponse, PageListFormat, PageListInclude, PageListQuery, PageResponse,
        }, model::{Page, PageType}},
        workspace::dto::WorkspaceResponseWithoutInclude,
    },
    shared::{error_handlers::handlers::ErrorResponse, extractors::query::ValidatedQuery},
    types::app_state::AppState,
};

pub fn build_page_tree(pages: Vec<(Page, PageResponse)>) -> Vec<(Page, PageResponse)> {
    let mut tree = Vec::new();

    for (page, page_response) in pages.iter() {
        if page.r#type != PageType::Group {
            tree.push((page.clone(), page_response.clone()));
            continue;
        }

        let children = pages
            .iter()
            .filter(|(p, _)| p.parent_page_id == Some(page.id))
            .map(|(_, page_response)| ChildPageResponse::from(page_response.clone()))
            .collect::<Vec<_>>();

        tree.push((page.clone(), PageResponse {
            id: page.id,
            r#type: page.r#type.clone(),
            title: page.title.clone(),
            text: page.text.clone(),
            owner: page_response.owner.clone(),
            workspace: page_response.workspace.clone(),
            parent_page: page_response.parent_page.clone(),
            child_pages: Some(children),
            created_at: page.created_at,
            updated_at: page.updated_at,
            deleted_at: page.deleted_at,
        }));
    }

    tree 
}

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages",
    operation_id = "get_list_in_workspace",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
        ("include" = Option<Vec<PageListInclude>>, Query, explode = false, description = "Include related entities"),
        ("format" = Option<PageListFormat>, Query, description = "Format of response"),
    ),
    responses(
        (status = 200, description = "List of pages", body = Vec<PageResponse>),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Page"],
)]
pub async fn get_list_in_workspace(
    State(state): State<AppState>,
    ValidatedQuery(query): ValidatedQuery<PageListQuery>,
    Path(workspace_id): Path<Uuid>,
) -> Result<Json<Vec<PageResponse>>, ErrorResponse> {
    let pages = crate::entities::page::service::get_all_in_workspace(&state.db, workspace_id).await;

    if let Err(error) = pages {
        return Err(error);
    }

    let pages = pages.unwrap();

    let mut include_owner = false;
    let mut include_workspace = false;
    let is_tree = query.format == Some(PageListFormat::Tree);

    if let Some(include) = query.include {
        include_owner = include.contains(&PageListInclude::Owner);
        include_workspace = include.contains(&PageListInclude::Workspace);
    }

    let mut response: Vec<(Page, PageResponse)> = Vec::new();

    for page in pages {
        response.push((
            page.clone(),
            PageResponse {
                id: page.id,
                r#type: page.r#type,
                title: page.title,
                text: page.text,
                owner: if include_owner {
                    Some(
                        crate::entities::user::service::find_by_id(&state.db, page.owner_id)
                            .await?,
                    )
                } else {
                    None
                },
                workspace: if include_workspace {
                    Some(
                        crate::entities::workspace::service::get_by_id(
                            &state.db,
                            page.workspace_id,
                        )
                        .await
                        .map(WorkspaceResponseWithoutInclude::from)?,
                    )
                } else {
                    None
                },
                parent_page: None,
                child_pages: None,
                created_at: page.created_at,
                updated_at: page.updated_at,
                deleted_at: page.deleted_at,
            },
        ));
    }

    if is_tree {
        response = build_page_tree(response);
    }

    Ok(Json(response.iter().map(|(_, page_response)| page_response.clone()).collect()))
}
