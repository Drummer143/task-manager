use axum::{
    extract::{Path, State},
    Json,
};
use error_handlers::handlers::ErrorResponse;
use rust_api::entities::page::dto::UpdatePageDto;
use uuid::Uuid;

use crate::{entities::page::dto::PageResponse, types::app_state::AppState};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/pages/{page_id}",
    operation_id = "update_page",
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    request_body = UpdatePageDto,
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
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    Json(update_page_dto): Json<UpdatePageDto>,
) -> Result<PageResponse, ErrorResponse> {
    crate::entities::page::service::update(
        &state.postgres,
        &state
            .mongo
            .database(rust_api::shared::constants::PAGE_DATABASE),
        page_id,
        update_page_dto,
    )
    .await
    .map(PageResponse::from)
}
