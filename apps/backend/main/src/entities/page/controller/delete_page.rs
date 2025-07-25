use axum::extract::{Path, State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::page::dto::PageResponse, shared::traits::ServiceDeleteMethod, types::app_state::AppState};

#[utoipa::path(
    delete,
    path = "/workspaces/{workspace_id}/pages/{page_id}",
    operation_id = "delete_page",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
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
    Path((_, page_id)): Path<(Uuid, Uuid)>,
) -> Result<PageResponse, ErrorResponse> {
    crate::entities::page::PageService::delete(&state, page_id)
        .await
        .map(PageResponse::from)
}
