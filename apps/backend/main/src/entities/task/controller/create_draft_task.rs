use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    entities::task::{TaskService, dto::TaskResponse},
    shared::extractors::path::ValidatedPath,
    types::app_state::AppState,
};

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateDraftRequest {
    pub board_status_id: Option<Uuid>,
}

#[utoipa::path(
    post,
    path = "/pages/{page_id}/tasks/draft",
    operation_id = "create_draft_task",
    request_body(content = CreateDraftRequest),
    responses(
        (status = 200, description = "Task created successfully", body = TaskResponse),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    tag = "Tasks",
)]
#[axum_macros::debug_handler]
pub async fn create_draft_task(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    ValidatedPath(page_id): ValidatedPath<Uuid>,
    Json(body): Json<CreateDraftRequest>,
) -> Result<Json<TaskResponse>, ErrorResponse> {
    TaskService::create_draft(&state, page_id, user_id, body)
        .await
        .map(|t| Json(TaskResponse::from(t)))
}
