use axum::{Json, extract::{Path, State}};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::page::dto::PageResponse, shared::traits::ServiceGetOneByIdMethod,
    types::app_state::AppState,
};

#[utoipa::path(
    get,
    path = "/pages/{page_id}",
    operation_id = "get_page",
    params(
        ("page_id", Path, description = "Page ID"),
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
    Path(page_id): Path<Uuid>,
) -> Result<Json<PageResponse>, ErrorResponse> {
    crate::entities::page::PageService::get_one_by_id(&state, page_id)
        .await
        .map(|p| Json(PageResponse::from(p)))
}
