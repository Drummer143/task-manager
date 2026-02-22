use std::collections::HashMap;

use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use sql::page::model::{Page, PageType};
use uuid::Uuid;

use crate::{
    entities::page::dto::{PageSummary, PageListFormat, PageListQuery, PageResponse},
    shared::extractors::query::ValidatedQuery,
    types::app_state::AppState,
};

pub fn build_page_tree(pages: Vec<(Page, PageResponse)>) -> Vec<(Page, PageResponse)> {
    let mut children_by_parent: HashMap<Option<Uuid>, Vec<(Page, PageResponse)>> = HashMap::new();

    for entry in pages {
        children_by_parent
            .entry(entry.0.parent_page_id)
            .or_default()
            .push(entry);
    }

    let Some(roots) = children_by_parent.get(&None) else {
        return Vec::new();
    };

    roots
        .iter()
        .map(|(page, response)| {
            if page.r#type != PageType::Group {
                return (page.clone(), response.clone());
            }

            let child_pages = children_by_parent
                .get(&Some(page.id))
                .map(|children| {
                    children
                        .iter()
                        .map(|(_, resp)| PageSummary::from(resp.clone()))
                        .collect()
                })
                .unwrap_or_default();

            (
                page.clone(),
                PageResponse {
                    child_pages: Some(child_pages),
                    ..response.clone()
                },
            )
        })
        .collect()
}

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages",
    operation_id = "get_list_in_workspace",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
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
    let pages =
        crate::entities::page::PageService::get_all_in_workspace(&state, workspace_id).await?;

    let is_tree = query.format == Some(PageListFormat::Tree);

    let mut response: Vec<(Page, PageResponse)> = Vec::new();

    for page in pages {
        response.push((
            page.clone(),
            PageResponse {
                id: page.id,
                r#type: page.r#type,
                title: page.title,
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

    Ok(Json(
        response
            .iter()
            .map(|(_, page_response)| page_response.clone())
            .collect(),
    ))
}
