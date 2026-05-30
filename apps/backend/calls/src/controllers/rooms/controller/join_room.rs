use axum::{
    Extension, Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    controllers::rooms::dto::{JoinRoomDto, JoinRoomResponse},
    services::rooms::RoomsService,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/calls/rooms/{room_id}/join",
    operation_id = "join_room",
    request_body = JoinRoomDto,
    params(
        ("room_id" = Uuid, Path, description = "Room ID"),
    ),
    responses(
        (status = 200, description = "LiveKit credentials for the room", body = JoinRoomResponse),
        (status = 403, description = "Access denied", body = ErrorResponse),
        (status = 404, description = "Room not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Rooms"
)]
pub async fn join_room(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(room_id): Path<Uuid>,
    Json(dto): Json<JoinRoomDto>,
) -> Result<Json<JoinRoomResponse>, ErrorResponse> {
    let (token, server_url) =
        RoomsService::join(&state, room_id, user_id, dto.access_token).await?;

    Ok(Json(JoinRoomResponse { token, server_url }))
}
