use axum::extract::State;
use error_handlers::handlers::ErrorResponse;
use rust_api::entities::user::model::User;
use uuid::Uuid;

use crate::{
    shared::{extractors::query::ValidatedQuery, traits::ServiceGetAllWithPaginationMethod},
    types::{app_state::AppState, pagination::Pagination},
};

#[derive(serde::Deserialize, Debug)]
pub struct GetListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub email: Option<String>,
    pub username: Option<String>,
    pub query: Option<String>,
    pub workspace_id: Option<Uuid>,
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    exclude: Option<Vec<Uuid>>,
    sort_by: Option<rust_api::entities::user::dto::UserSortBy>,
    sort_order: Option<rust_api::shared::types::SortOrder>,
}

#[utoipa::path(
    get,
    path = "/users",
    operation_id = "get_users_list",
    params(
        ("limit" = Option<i64>, Query, description = "Count of items to return. Default: 10"),
        ("offset" = Option<i64>, Query, description = "Start position. Default: 0"),
        ("email" = Option<String>, Query, description = "Filter by email. Can't be used with query"),
        ("username" = Option<String>, Query, description = "Filter by username. Can't be used with query"),
        ("query" = Option<String>, Query, description = "Search by username or email. Can't be used with email or username"),
        ("workspace_id" = Option<Uuid>, Query, description = "Filter by workspace id"),
        ("exclude" = Option<Vec<Uuid>>, Query, explode = false, description = "Array of ids to exclude separated by comma"),
        ("sort_by" = Option<crate::entities::user::dto::UserSortBy>, Query, description = "Sort by field. Default: createdAt"),
        ("sort_order" = Option<crate::types::pagination::SortOrder>, Query, description = "Sort order. Default: asc"),
    ),
    responses(
        (status = 200, description = "List of users", body = Pagination<User>),
        (status = 400, description = "Invalid query parameters", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["User"]
)]
pub async fn get_list(
    State(state): State<AppState>,
    ValidatedQuery(query): ValidatedQuery<GetListQuery>,
) -> Result<Pagination<User>, ErrorResponse> {
    let filters = rust_api::entities::user::dto::UserFilterBy {
        email: query.email,
        username: query.username,
        query: query.query,
        exclude: query.exclude,
        workspace_id: query.workspace_id,
    };

    if !filters.is_valid() {
        return Err(ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidQueryParams,
            Some(std::collections::HashMap::from([(
                "filter".to_string(),
                "You can't use all query with username or email filter at the same time"
                    .to_string(),
            )])),
            None,
        ));
    }

    let (users, total) = crate::entities::user::UserService::get_all_with_pagination(
        &state,
        query.limit,
        query.offset,
        Some(filters),
        query.sort_by,
        query.sort_order,
    )
    .await?;

    Ok(Pagination::new(
        users,
        total,
        query
            .limit
            .unwrap_or(rust_api::shared::constants::DEFAULT_LIMIT),
        query
            .offset
            .unwrap_or(rust_api::shared::constants::DEFAULT_OFFSET),
    ))
}
