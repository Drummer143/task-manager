use axum::{
    extract::{Path, State},
    http::header::HeaderMap,
    Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::board_statuses::dto::BoardStatusResponseDto,
    types::app_state::AppState,
};

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
        .get("User-Language")
        .map(|lang| lang.to_str().unwrap_or("en"))
        .unwrap_or("en");

    crate::entities::board_statuses::BoardStatusService::get_board_statuses_by_page_id(
        &state, page_id,
    )
    .await
    .map(|statuses| {
        let statuses = statuses
            .iter()
            .map(|status| BoardStatusResponseDto {
                id: status.id,
                initial: status.initial,
                title: status.localizations.get(lang).unwrap().to_string(),
            })
            .collect::<Vec<BoardStatusResponseDto>>();

        Json(statuses)
    })

    // for status in statuses.iter_mut() {
    //     let child_statuses: Vec<ChildBoardStatusResponseDto> = sql::board_statuses::BoardStatusRepository::get_child_statuses_by_parent_status_id(
    //         &state.postgres, status.status.id,
    //     )
    //     .await
    //     .map(|statuses| {
    //             statuses
    //                 .iter()
    //                 .map(|status| ChildBoardStatusResponseDto {
    //                     code: status.code.clone(),
    //                     title: status
    //                         .localizations
    //                         .get(lang)
    //                         .unwrap_or(&status.localizations["en"])
    //                         .to_string(),
    //                     id: status.id,
    //                     position: status.position,
    //                     initial: status.initial,
    //                 })
    //                 .collect::<Vec<ChildBoardStatusResponseDto>>()
    //         })?;

    //     if !child_statuses.is_empty() {
    //         status.child_statuses = Some(child_statuses);
    //     }
    // }
}
