use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::page::model::PageAccess;
use uuid::Uuid;

use crate::{
    entities::page::{PageService, dto::DetailedPageResponse},
    shared::extractors::{path::ValidatedPath, x_user_language::XUserLanguage},
    types::app_state::AppState,
};

#[utoipa::path(
    get,
    path = "/pages/{page_id}/detailed",
    operation_id = "get_page_detailed",
    params(
        ("page_id", Path, description = "Page ID"),
    ),
    responses(
        (status = 200, description = "Page details", body = DetailedPageResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Page"],
)]
pub async fn get_page_details(
    State(state): State<AppState>,
    Extension(page_access): Extension<PageAccess>,
    ValidatedPath(page_id): ValidatedPath<Uuid>,
    XUserLanguage(lang): XUserLanguage,
) -> Result<Json<DetailedPageResponse>, ErrorResponse> {
    PageService::get_detailed_page(&state, page_id, page_access, lang)
        .await
        .map(Json)
}
