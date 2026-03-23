use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CheckBlobsDto {
    pub blob_ids: Vec<String>,
}

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CheckBlobsResponse {
    pub existing_blob_ids: Vec<String>,
}
