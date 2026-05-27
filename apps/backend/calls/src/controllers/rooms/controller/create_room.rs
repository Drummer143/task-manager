use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use sql::rooms::model::Room;
use uuid::Uuid;

use crate::{
    controllers::rooms::dto::CreateRoomDto, services::rooms::CallsService,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/calls/room",
    operation_id = "create_call_room",
    request_body = CreateRoomDto,
    responses(
        (status = 200, description = "Call room created", body = Room),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Calls"
)]
pub async fn create_room(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Json(dto): Json<CreateRoomDto>,
) -> Result<Json<Room>, ErrorResponse> {
    CallsService::create_room(
        &state,
        crate::repos::rooms::dto::CreateRoomDto {
            name: dto.name,
            created_by: user_id,
            visibility: dto.visibility,
        },
    )
    .await
    .map(Json)
}
