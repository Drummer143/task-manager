use axum::{
    Json,
    extract::{Path, State},
    http::HeaderMap,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    controllers::board_statuses::dto::{BoardStatusResponse, CreateBoardStatusRequest},
    repos::board_statuses::CreateBoardStatusDto,
    services::board_statuses::BoardStatusService,
    shared::extractors::json::ValidatedJson,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/pages/{page_id}/board-statuses",
    params(
        ("page_id" = Uuid, Path, description = "Page ID"),
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
    let mut tx = app_state.postgres.begin().await?;

    let board_status = BoardStatusService::create(
        &mut tx,
        CreateBoardStatusDto {
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
    })?;

    tx.commit().await.map_err(ErrorResponse::from)?;
    
    Ok(board_status)
}
