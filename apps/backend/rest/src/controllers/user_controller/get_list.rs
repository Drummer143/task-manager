use axum::{extract::State, response::IntoResponse};
use uuid::Uuid;

use crate::{
    shared::{
        error_handlers::handlers::ErrorResponse, extractors::query::ValidatedQuery, traits::IsValid,
    },
    types::app_state::AppState,
};

#[derive(serde::Deserialize)]
pub struct GetListQuery {
    limit: Option<i64>,
    offset: Option<i64>,
    email: Option<String>,
    username: Option<String>,
    query: Option<String>,
    #[serde(default, deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param")]
    exclude: Option<Vec<Uuid>>,
    sort_by: Option<crate::models::user::UserSortBy>,
    sort_order: Option<crate::types::pagination::SortOrder>,
}

#[utoipa::path(
    get,
    path = "/users",
    params(
        ("limit" = Option<i64>, Query, description = "Count of items to return. Default: 10"),
        ("offset" = Option<i64>, Query, description = "Start position. Default: 0"),
        ("email" = Option<String>, Query, description = "Filter by email. Can't be used with query"),
        ("username" = Option<String>, Query, description = "Filter by username. Can't be used with query"),
        ("query" = Option<String>, Query, description = "Search by username or email. Can't be used with email or username"),
        ("exclude" = Option<Vec<Uuid>>, Query, explode = false, description = "Array of ids to exclude separated by comma"),
        ("sort_by" = Option<crate::models::user::UserSortBy>, Query, description = "Sort by field. Default: createdAt"),
        ("sort_order" = Option<crate::types::pagination::SortOrder>, Query, description = "Sort order. Default: asc"),
    ),
    responses(
        (status = 200, description = "List of users", body = crate::types::pagination::Pagination<crate::models::user::User>),
        (status = 400, description = "Invalid query parameters", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Users"]
)]
pub async fn get_list(
    State(state): State<AppState>,
    ValidatedQuery(query): ValidatedQuery<GetListQuery>,
) -> impl IntoResponse {
    let filters = crate::models::user::UserFilterBy {
        email: query.email,
        username: query.username,
        query: query.query,
        exclude: query.exclude,
    };

    if !filters.is_valid() {
        return Err(ErrorResponse::bad_request(
            crate::shared::error_handlers::codes::BadRequestErrorCode::InvalidQueryParams,
            Some(std::collections::HashMap::from([(
                "filter".to_string(),
                "You can't use all query with username or email filter at the same time"
                    .to_string(),
            )])),
        ));
    }

    crate::services::user_service::UserService::new(&state.db)
        .get_list(
            query.limit,
            query.offset,
            Some(filters),
            query.sort_by,
            query.sort_order,
        )
        .await
}
