use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Deserialize, ToSchema)]
pub struct CreateCallTokenRequest {
    pub room_id: Option<Uuid>,
}

#[derive(Serialize, ToSchema)]
pub struct CreateCallTokenResponse {
    pub token: String,
}
