use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use sql::rooms::model::Room;
use uuid::Uuid;

use crate::{services::rooms::RoomsService, types::app_state::AppState};

#[utoipa::path(
    get,
    path = "/calls/rooms/{room_id}",
    operation_id = "get_call_room",
    params(
        ("room_id" = Uuid, Path, description = "Room ID"),
    ),
    responses(
        (status = 200, description = "Room", body = Room),
        (status = 404, description = "Room not found", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Rooms"
)]
pub async fn get_room(
    State(state): State<AppState>,
    Path(room_id): Path<Uuid>,
) -> Result<Json<Room>, ErrorResponse> {
    RoomsService::get_room(&state, room_id).await.map(Json)
}
