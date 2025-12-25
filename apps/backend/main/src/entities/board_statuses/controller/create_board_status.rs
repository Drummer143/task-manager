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
        dto::{BoardStatusResponseDto, CreateBoardStatusDto},
    },
    shared::{extractors::json::ValidatedJson, traits::ServiceCreateMethod},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/workspaces/{workspace_id}/pages/{page_id}/board-statuses",
    params(
        ("workspace_id", Path, description = "Workspace ID"),
        ("page_id", Path, description = "Page ID"),
    ),
    request_body = CreateBoardStatusDto,
    responses(
        (status = 200, description = "Custom status created successfully", body = BoardStatusResponseDto),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
    ),
    tag = "Board Status"
)]
#[axum_macros::debug_handler]
pub async fn create_board_status(
    header_map: HeaderMap,
    State(app_state): State<AppState>,
    Path((_, page_id)): Path<(Uuid, Uuid)>,
    ValidatedJson(dto): ValidatedJson<CreateBoardStatusDto>,
) -> Result<Json<BoardStatusResponseDto>, ErrorResponse> {
    BoardStatusService::create(
        &app_state,
        rust_api::entities::board_statuses::dto::CreateBoardStatusDto {
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

        return Json(BoardStatusResponseDto {
            id: status.id,
            initial: status.initial,
            title,
        });
    })
}
