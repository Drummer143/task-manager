use axum::{
    Json, Extension,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::page::dto::{CreatePageRequest, PageResponse},
    shared::{extractors::json::ValidatedJson, traits::ServiceCreateMethod},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/workspaces/{workspace_id}/pages",
    operation_id = "create_page",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
    ),
    request_body = CreatePageRequest,
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
    ValidatedJson(create_page_dto): ValidatedJson<CreatePageRequest>,
) -> Result<Json<PageResponse>, ErrorResponse> {
    crate::entities::page::PageService::create(
        &state,
        crate::entities::page::db::dto::CreatePageDto {
            title: create_page_dto.title,
            r#type: create_page_dto.r#type,
            parent_page_id: create_page_dto.parent_page_id,
            content: create_page_dto.content,
            workspace_id,
            owner_id: user_id,
        },
    )
    .await
    .map(|p| Json(PageResponse::from(p)))
}
