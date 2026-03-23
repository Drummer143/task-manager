use serde::Deserialize;
use sql::blobs::model::Blob;
use uuid::Uuid;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
#[serde(tag = "type", content = "id", rename_all = "camelCase")]
pub enum AssetTarget {
    PageText(Uuid),
    TaskDescription(Uuid),
    Avatar(Uuid),
    UserDraft,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateUploadTokenDto {
    pub target: AssetTarget,
    pub name: String,
    pub asset_id: Uuid,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateAssetDto {
    pub token: String,
    pub blob: Blob,
}
