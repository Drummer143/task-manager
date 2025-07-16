use std::collections::HashMap;

use axum::{
    extract::{Path, State},
    Json,
};
use error_handlers::{codes, handlers::ErrorResponse};
use rust_api::entities::page::model::{Page, PageType};
use uuid::Uuid;

use crate::{
    entities::{
        page::dto::{
            ChildPageResponse, PageListFormat, PageListInclude, PageListQuery, PageResponse,
        },
        workspace::dto::WorkspaceResponseWithoutInclude,
    },
    shared::extractors::query::ValidatedQuery,
    types::app_state::AppState,
};

pub fn build_page_tree(pages: Vec<(Page, PageResponse)>) -> Vec<(Page, PageResponse)> {
    let mut tree = Vec::new();
    let mut parent_map: HashMap<Option<Uuid>, Vec<(Page, PageResponse)>> = HashMap::new();

    for entry in pages.into_iter() {
        parent_map
            .entry(entry.0.parent_page_id)
            .or_default()
            .push(entry);
    }

    if let Some(roots) = parent_map.get(&None) {
        for (page, page_response) in roots {
            if page.r#type != PageType::Group {
                tree.push((page.clone(), page_response.clone()));
            } else {
                let children = parent_map
                    .get(&Some(page.id))
                    .into_iter()
                    .flat_map(|v| v.iter())
                    .map(|(_, resp)| ChildPageResponse::from(resp.clone()))
                    .collect();

                tree.push((
                    page.clone(),
                    PageResponse {
                        child_pages: Some(children),
                        ..page_response.clone()
                    },
                ));
            }
        }
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
    let pages =
        crate::entities::page::service::get_all_in_workspace(&state.postgres, workspace_id).await;

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
                text: page.text.map(crate::entities::page::dto::DocResponse::from),
                owner: if include_owner {
                    Some(
                        crate::entities::user::service::find_by_id(&state.postgres, page.owner_id)
                            .await?,
                    )
                } else {
                    None
                },
                role: Some(
                    rust_api::entities::page_access::repository::get_page_access(
                        &state.postgres,
                        page.owner_id,
                        page.id,
                    )
                    .await
                    .map_err(|e| match e {
                        sqlx::Error::RowNotFound => {
                            ErrorResponse::not_found(codes::NotFoundErrorCode::NotFound, None)
                        }
                        _ => ErrorResponse::internal_server_error(None),
                    })?
                    .role,
                ),
                workspace: if include_workspace {
                    Some(
                        crate::entities::workspace::service::get_by_id(
                            &state.postgres,
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
                tasks: None,
                board_statuses: None,
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
