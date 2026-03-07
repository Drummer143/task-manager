use axum::{
    extract::{Path, State},
    Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::task::dto::TaskResponse, services::tasks::TaskService};

#[utoipa::path(
    get,
    path = "/pages/{page_id}/tasks",
    responses(
        (status = 200, description = "Tasks retrieved successfully", body = Vec<TaskResponse>),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
    ),
    tag = "Tasks",
)]
pub async fn get_tasks_in_page(
    State(state): State<crate::types::app_state::AppState>,
    Path(page_id): Path<Uuid>,
    headers: axum::http::header::HeaderMap,
) -> Result<Json<Vec<TaskResponse>>, ErrorResponse> {
    let lang = headers
        .get("User-Language")
        .map(|h| h.to_str().unwrap_or("en"))
        .unwrap_or("en");

    TaskService::get_tasks_in_page_with_details(&state.postgres, page_id, lang)
        .await
        .map(Json)
}
