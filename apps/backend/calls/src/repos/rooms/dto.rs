use uuid::Uuid;

use sql::rooms::model::RoomVisibility;

pub struct CreateRoomDto {
    pub name: String,
    pub visibility: Option<RoomVisibility>,
    pub created_by: Uuid,
}
