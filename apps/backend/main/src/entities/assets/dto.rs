use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize, utoipa::ToSchema)]
#[serde(tag = "type", content = "id", rename_all = "camelCase")]
pub enum AssetTarget {
    PageText(Uuid),
    TaskDescription(Uuid),
}

#[derive(Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateUploadTokenRequest {
    pub target: AssetTarget,
    pub name: String,
    pub asset_id: Uuid,
}

#[derive(Serialize, utoipa::ToSchema)]
pub struct CreateUploadTokenResponse {
    pub token: String,
}

#[derive(Deserialize, utoipa::ToSchema)]
pub struct CreateAssetRequest {
    pub token: String,
    pub blob_id: Uuid,
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
