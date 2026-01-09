use axum::{extract::State, Extension};
use error_handlers::handlers::ErrorResponse;

use crate::{
    entities::workspace::dto::{Include, WorkspaceResponse},
    shared::extractors::query::ValidatedQuery,
    types::pagination::Pagination,
};

#[utoipa::path(
    get,
    path = "/workspaces",
    operation_id = "get_workspaces_list",
    params(
        ("limit" = Option<i64>, Query, description = "Count of items to return. Default: 10"),
        ("offset" = Option<i64>, Query, description = "Start position. Default: 0"),
        ("search" = Option<String>, Query, description = "Search by name"),
        ("sort_by" = Option<sql::workspace::dto::WorkspaceSortBy>, Query, description = "Sort by field. Default: createdAt"),
        ("sort_order" = Option<sql::shared::types::SortOrder>, Query, description = "Sort order. Default: asc"),
        ("include" = Option<Vec<Include>>, Query, explode = false, description = "Include related entities"),
    ),
    responses(
        (status = 200, description = "List of workspaces", body = Pagination<crate::entities::workspace::dto::WorkspaceResponse>),
        (status = 400, description = "Invalid query parameters", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"]
)]
pub async fn get_list(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<uuid::Uuid>,
    ValidatedQuery(query): ValidatedQuery<crate::entities::workspace::dto::GetListQueryDto>,
) -> Result<Pagination<WorkspaceResponse>, ErrorResponse> {
    let include = query.include.unwrap_or_default();

    let (result, count) = crate::entities::workspace::WorkspaceService::get_list(
        &state,
        user_id,
        query.limit,
        query.offset,
        query.search,
        query.sort_by,
        query.sort_order,
        include.contains(&Include::Owner),
        include.contains(&Include::Pages),
    )
    .await?;

    Ok(Pagination::new(
        result
            .iter()
            .map(|workspace| WorkspaceResponse::from(workspace))
            .collect(),
        count,
        query
            .limit
            .unwrap_or(sql::shared::constants::DEFAULT_LIMIT),
        query
            .offset
            .unwrap_or(sql::shared::constants::DEFAULT_OFFSET),
    ))
}
