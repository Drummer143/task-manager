use axum::{
    extract::{Path, State},
    Extension, Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::page::dto::{CreatePageDto, PageResponse},
    shared::traits::ServiceCreateMethod,
    types::app_state::AppState,
};

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
    crate::entities::page::PageService::create(
        &state,
        rust_api::entities::page::dto::CreatePageDto {
            title: create_page_dto.title,
            r#type: create_page_dto.r#type,
            parent_page_id: create_page_dto.parent_page_id,
            text: create_page_dto.text,
            workspace_id,
            owner_id: user_id,
        },
    )
    .await
    .map(PageResponse::from)
}
