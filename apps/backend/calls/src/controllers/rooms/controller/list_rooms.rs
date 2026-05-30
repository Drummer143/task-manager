use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::rooms::model::Room;
use uuid::Uuid;

use crate::{services::rooms::RoomsService, types::app_state::AppState};

#[utoipa::path(
    get,
    path = "/calls/rooms",
    operation_id = "list_call_rooms",
    responses(
        (status = 200, description = "Rooms created by the current user", body = Vec<Room>),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Rooms"
)]
pub async fn list_rooms(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
) -> Result<Json<Vec<Room>>, ErrorResponse> {
    RoomsService::list_rooms(&state, user_id).await.map(Json)
}
