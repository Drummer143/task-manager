use axum::{
    Extension, Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    controllers::rooms::dto::{GenerateRoomTokenDto, GenerateRoomTokenResponse},
    services::rooms::RoomsService,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/calls/rooms/{room_id}/access-tokens",
    operation_id = "generate_room_access_token",
    request_body = GenerateRoomTokenDto,
    params(
        ("room_id" = Uuid, Path, description = "Room ID"),
    ),
    responses(
        (status = 200, description = "Access token generated", body = GenerateRoomTokenResponse),
        (status = 403, description = "Only the room owner can issue access tokens", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Rooms"
)]
pub async fn generate_room_token(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Path(room_id): Path<Uuid>,
    Json(dto): Json<GenerateRoomTokenDto>,
) -> Result<Json<GenerateRoomTokenResponse>, ErrorResponse> {
    let (token, expires_in) =
        RoomsService::generate_access_token(&state, room_id, user_id, dto.ttl_seconds).await?;

    Ok(Json(GenerateRoomTokenResponse { token, expires_in }))
}
