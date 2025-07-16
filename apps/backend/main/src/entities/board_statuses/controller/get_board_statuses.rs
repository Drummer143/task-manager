use axum::{
    extract::{Path, State},
    http::header::HeaderMap, Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::board_statuses::dto::BoardStatusResponseDto, types::app_state::AppState};

#[utoipa::path(
    get,
    path = "/workspaces/{workspace_id}/pages/{page_id}/board-statuses",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
        ("page_id", Path, description = "Page ID"),
    ),
    responses(
        (status = 200, description = "Board statuses retrieved successfully", body = Vec<BoardStatusResponseDto>),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tag = "Board Status"
)]
pub async fn get_board_statuses(
    State(state): State<AppState>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    headers: HeaderMap,
) -> Result<Json<Vec<BoardStatusResponseDto>>, ErrorResponse> {
    let lang = headers
        .get("Accept-Language")
        .map(|lang| lang.to_str().unwrap_or("en"))
        .unwrap_or("en");

    crate::entities::board_statuses::service::get_board_statuses_by_page_id(
        &state.postgres,
        page_id,
    )
    .await
    .map(|statuses| {
        let statuses = statuses
            .iter()
            .map(|status| BoardStatusResponseDto {
                code: status.code.clone(),
                title: status
                    .localizations
                    .get(lang)
                    .unwrap_or(&status.localizations["en"])
                    .to_string(),
                id: status.id,
                r#type: status.r#type.clone(),
                position: status.position,
                initial: status.initial,
            })
            .collect::<Vec<BoardStatusResponseDto>>();

        Json(statuses)
    })
}
