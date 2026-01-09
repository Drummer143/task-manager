use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::page::dto::PageResponse, shared::traits::ServiceDeleteMethod, types::app_state::AppState};

#[utoipa::path(
    delete,
    path = "/pages/{page_id}",
    operation_id = "delete_page",
    params(
        ("page_id", Path, description = "Page ID"),
    ),
    responses(
        (status = 200, description = "Page deleted", body = PageResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Page"],
)]
pub async fn delete_page(
    State(state): State<AppState>,
    Path(page_id): Path<Uuid>,
) -> Result<PageResponse, ErrorResponse> {
    crate::entities::page::PageService::delete(&state, page_id)
        .await
        .map(PageResponse::from)
}
