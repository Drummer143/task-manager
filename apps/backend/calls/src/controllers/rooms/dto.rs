use serde::{Deserialize, Serialize};
use sql::rooms::model::RoomVisibility;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct CreateRoomDto {
    pub name: String,
    pub visibility: Option<RoomVisibility>,
}

/// Body for issuing a new access token for a private room (host only).
#[derive(Deserialize, ToSchema)]
pub struct GenerateRoomTokenDto {
    /// Optional TTL in seconds. Falls back to the service default when omitted.
    pub ttl_seconds: Option<u64>,
}

#[derive(Serialize, ToSchema)]
pub struct GenerateRoomTokenResponse {
    pub token: String,
    pub expires_in: u64,
}

/// Body for joining a room. `access_token` is required only for private rooms.
#[derive(Deserialize, ToSchema)]
pub struct JoinRoomDto {
    pub access_token: Option<String>,
}

#[derive(Serialize, ToSchema)]
pub struct JoinRoomResponse {
    /// LiveKit access JWT used by the client to connect.
    pub token: String,
    /// LiveKit server URL (wss://...).
    pub server_url: String,
}
