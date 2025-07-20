use std::collections::HashMap;

use axum::{
    extract::{Path, State},
    Json,
};
use error_handlers::handlers::ErrorResponse;
use rust_api::entities::board_statuses::dto::UpdateBoardStatusDto;
use uuid::Uuid;

use crate::{
    entities::board_statuses::dto::FullBoardStatusResponseDto, types::app_state::AppState,
};

#[utoipa::path(
    put,
    path = "/workspaces/{workspace_id}/pages/{page_id}/board-statuses/{status_id}",
    params(
        ("workspace_id" = Uuid, Path, description = "Workspace ID"),
        ("page_id" = Uuid, Path, description = "Page ID"),
        ("status_id" = Uuid, Path, description = "Status ID"),
    ),
    request_body = UpdateBoardStatusDto,
    responses(
        (status = 200, description = "Status updated successfully", body = FullBoardStatusResponseDto),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tag = "Board Status",
)]
pub async fn update_board_status(
    State(app_state): State<AppState>,
    Path((_, _, status_id)): Path<(Uuid, Uuid, Uuid)>,
    Json(dto): Json<UpdateBoardStatusDto>,
) -> Result<Json<FullBoardStatusResponseDto>, ErrorResponse> {
    if let Some(localizations) = &dto.localizations {
        if localizations.is_empty() || localizations.get("en").is_none() {
            return Err(ErrorResponse::unprocessable_entity(
                error_handlers::codes::UnprocessableEntityErrorCode::ValidationErrors,
                Some(HashMap::from([(
                    "localizations".to_string(),
                    "en localization is required".to_string(),
                )])),
                None,
            ));
        }
    }

    crate::entities::board_statuses::service::update_board_status(
        &app_state.postgres,
        status_id,
        dto,
    )
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
