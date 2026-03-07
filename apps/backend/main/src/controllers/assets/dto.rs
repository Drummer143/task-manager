use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize, utoipa::ToSchema)]
pub struct CreateUploadTokenResponse {
    pub token: String,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct AssetResponse {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct ValidateAccessResponse {
    pub blob_id: Uuid,
    pub name: String,
}
