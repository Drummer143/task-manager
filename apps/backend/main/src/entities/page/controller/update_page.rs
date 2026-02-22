use axum::{Json, extract::{Path, State}};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::page::dto::{PageResponse, UpdatePageRequest},
    shared::{extractors::json::ValidatedJson, traits::ServiceUpdateMethod},
    types::app_state::AppState,
};

#[utoipa::path(
    put,
    path = "/pages/{page_id}",
    operation_id = "update_page",
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = UpdatePageRequest,
    responses(
        (status = 200, description = "Page updated successfully", body = PageResponse),
        (status = 400, description = "Bad request", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Page"],
)]
pub async fn update_page(
    State(state): State<AppState>,
    Path(page_id): Path<Uuid>,
    ValidatedJson(update_page_dto): ValidatedJson<UpdatePageRequest>,
) -> Result<Json<PageResponse>, ErrorResponse> {
    crate::entities::page::PageService::update(&state, page_id, update_page_dto)
        .await
        .map(|p| Json(PageResponse::from(p)))
}
