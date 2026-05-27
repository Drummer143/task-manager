use error_handlers::handlers::ErrorResponse;
use sql::rooms::model::Room;

use crate::{
    repos::rooms::{RoomsRepository, dto::CreateRoomDto},
    types::app_state::AppState,
};

pub struct CallsService;

impl CallsService {
    pub async fn create_room(
        app_state: &AppState,
        dto: CreateRoomDto,
    ) -> Result<Room, ErrorResponse> {
        RoomsRepository::create_room(&app_state.postgres, &dto)
            .await
            .map_err(ErrorResponse::from)
    }
}
