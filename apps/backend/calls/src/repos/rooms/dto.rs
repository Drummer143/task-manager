use uuid::Uuid;

use sql::rooms::model::RoomVisibility;

pub struct CreateRoomDto {
    /// Optional. If `None`, repository falls back to the generated room id as the name.
    pub name: Option<String>,
    pub visibility: Option<RoomVisibility>,
    pub created_by: Uuid,
}
