use axum::{
    extract::{Path, State},
    Extension, Json,
};
use error_handlers::handlers::ErrorResponse;
use rust_api::entities::page::dto::CreatePageDto;
use uuid::Uuid;

use crate::{entities::page::dto::PageResponse, types::app_state::AppState};

#[utoipa::path(
    post,
    path = "/workspaces/{workspace_id}/pages",
    operation_id = "create_page",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
    ),
    request_body = CreatePageDto,
    responses(
        (status = 200, description = "Page created", body = PageResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Page"],
)]
pub async fn create_page(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(workspace_id): Path<Uuid>,
    Json(create_page_dto): Json<CreatePageDto>,
) -> Result<PageResponse, ErrorResponse> {
    crate::entities::page::service::create(
        &state.postgres,
        &state
            .mongo
            .database(rust_api::shared::constants::PAGE_DATABASE),
        create_page_dto,
        workspace_id,
        user_id,
    )
    .await
    .map(PageResponse::from)
}
