use axum::{
    Extension,
    extract::{Path, State},
    http::StatusCode,
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{services::rooms::RoomsService, types::app_state::AppState};

#[utoipa::path(
    delete,
    path = "/calls/rooms/{room_id}",
    operation_id = "delete_call_room",
    params(
        ("room_id" = Uuid, Path, description = "Room ID"),
    ),
    responses(
        (status = 204, description = "Room deleted"),
        (status = 403, description = "Only the room owner can delete the room", body = ErrorResponse),
        (status = 404, description = "Room not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Rooms"
)]
pub async fn delete_room(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(room_id): Path<Uuid>,
) -> Result<StatusCode, ErrorResponse> {
    RoomsService::delete_room(&state, room_id, user_id).await?;
    Ok(StatusCode::NO_CONTENT)
}
