use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
};
use uuid::Uuid;

use crate::{shared::extractors::path::ValidatedPath, types::app_state::AppState};

// pub fn get_list(
//     State(state): State<AppState>,
//     Query(limit): Query<Option<i64>>,
//     Query(offset): Query<Option<i64>>,
//     Query(filter): Query<Option<crate::models::user::UserFilterBy>>,
//     Query(sort_by): Query<Option<crate::models::user::UserSortBy>>,
//     Query(sort_order): Query<Option<crate::types::pagination::SortOrder>>,
//     Query(query): Query<Option<String>>,
//     Query(email): Query<Option<String>>,
//     Query(phone): Query<Option<String>>,
// ) -> impl IntoResponse {

// }

#[axum_macros::debug_handler]
pub async fn get_by_id(State(state): State<AppState>, ValidatedPath(id): ValidatedPath<Uuid>) -> impl IntoResponse {
    crate::services::user_service::UserService::new(&state.db).find_by_id(id).await
}
