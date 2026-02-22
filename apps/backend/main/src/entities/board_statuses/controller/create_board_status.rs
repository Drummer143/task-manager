use axum::{
    Json,
    extract::{Path, State},
    http::HeaderMap,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::board_statuses::{
        BoardStatusService,
        dto::{BoardStatusResponse, CreateBoardStatusRequest},
    },
    shared::{extractors::json::ValidatedJson, traits::ServiceCreateMethod},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/pages/{page_id}/board-statuses",
    params(
        ("page_id", Path, description = "Page ID"),
    ),
    request_body = CreateBoardStatusRequest,
    responses(
        (status = 200, description = "Custom status created successfully", body = BoardStatusResponse),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
    ),
    tag = "Board Status"
)]
#[axum_macros::debug_handler]
pub async fn create_board_status(
    header_map: HeaderMap,
    State(app_state): State<AppState>,
    Path(page_id): Path<Uuid>,
    ValidatedJson(dto): ValidatedJson<CreateBoardStatusRequest>,
) -> Result<Json<BoardStatusResponse>, ErrorResponse> {
    BoardStatusService::create(
        &app_state,
        crate::entities::board_statuses::db::CreateBoardStatusDto {
            // parent_status_id: dto.parent_status_id,
            page_id,
            initial: dto.initial,
            position: dto.position,
            localizations: sqlx::types::Json(dto.localizations),
        },
    )
    .await
    .map(|status| {
        let lang = header_map
            .get("User-Language")
            .map(|h| h.to_str().unwrap_or("en"))
            .unwrap_or("en");

        let title = status.localizations.get(lang).unwrap().to_string();

        Json(BoardStatusResponse {
            id: status.id,
            initial: status.initial,
            title,
        })
    })
}
