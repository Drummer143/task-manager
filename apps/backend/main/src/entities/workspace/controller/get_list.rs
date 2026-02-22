use axum::{Extension, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::shared::types::SortOrder;
use uuid::Uuid;

use crate::{
    entities::workspace::{WorkspaceService, db::WorkspaceSortBy, dto::{WorkspaceListQuery, WorkspaceResponse}}, shared::extractors::query::ValidatedQuery,
    types::{app_state::AppState, pagination::Pagination},
};

#[utoipa::path(
    get,
    path = "/workspaces",
    operation_id = "get_workspaces_list",
    params(
        ("limit" = Option<i64>, Query, description = "Count of items to return. Default: 10"),
        ("offset" = Option<i64>, Query, description = "Start position. Default: 0"),
        ("search" = Option<String>, Query, description = "Search by name"),
        ("sort_by" = Option<WorkspaceSortBy>, Query, description = "Sort by field. Default: createdAt"),
        ("sort_order" = Option<SortOrder>, Query, description = "Sort order. Default: asc"),
    ),
    responses(
        (status = 200, description = "List of workspaces", body = Pagination<WorkspaceResponse>),
        (status = 400, description = "Invalid query parameters", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Workspace"]
)]
pub async fn get_list(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    ValidatedQuery(query): ValidatedQuery<WorkspaceListQuery>,
) -> Result<Pagination<WorkspaceResponse>, ErrorResponse> {
    let (workspaces, count) = WorkspaceService::get_list(
        &state,
        user_id,
        query.limit,
        query.offset,
        query.search,
        query.sort_by,
        query.sort_order,
    )
    .await?;

    Ok(Pagination::new(
        workspaces,
        count,
        query.limit.unwrap_or(sql::shared::constants::DEFAULT_LIMIT),
        query
            .offset
            .unwrap_or(sql::shared::constants::DEFAULT_OFFSET),
    ))
}
