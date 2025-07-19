use axum::{
    extract::{Path, State},
    Json,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::board_statuses::dto::FullBoardStatusResponseDto, types::app_state::AppState,
};

#[utoipa::path(
    delete,
    path = "/workspaces/{workspace_id}/pages/{page_id}/board-statuses/{status_id}",
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
        ("status_id" = Uuid, Path, description = "Status ID"),
    ),
    responses(
        (status = 200, description = "Status deleted successfully", body = FullBoardStatusResponseDto),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tag = "Board Status",
)]
pub async fn delete_board_status(
    State(app_state): State<AppState>,
    Path((_, _, status_id)): Path<(Uuid, Uuid, Uuid)>,
) -> Result<Json<FullBoardStatusResponseDto>, ErrorResponse> {
    crate::entities::board_statuses::service::delete_board_status(&app_state.postgres, status_id)
        .await
        .map(|status| {
            Json(FullBoardStatusResponseDto {
                id: status.id,
                code: status.code,
                r#type: status.r#type,
                position: status.position,
                initial: status.initial,
                localizations: status.localizations.0,
            })
        })
}
