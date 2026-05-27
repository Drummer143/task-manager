use serde::{Deserialize, Serialize};
use sql::rooms::model::RoomVisibility;
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
pub struct CallTokenResponse {
    pub token: String,
}

#[derive(Deserialize, ToSchema)]
pub struct CreateRoomDto {
    pub name: String,
    pub visibility: Option<RoomVisibility>,
}

