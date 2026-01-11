use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::redis::transaction::VerifyRange;

#[derive(utoipa::ToSchema)]
pub struct UploadRequest {
    #[schema(value_type = String, format = Binary)]
    #[allow(dead_code)]
    pub file: String,
    #[allow(dead_code)]
    pub name: Option<String>,
}

#[derive(utoipa::ToSchema, serde::Serialize)]
pub struct UploadResponse {
    pub link: String,
    pub name: String,
    pub size: i64,
    pub created_at: DateTime<Utc>,
}

#[derive(utoipa::ToSchema, serde::Deserialize, serde::Serialize)]
pub struct UploadInitDto {
    pub hash: String,
    pub size: u64,
}

#[derive(utoipa::ToSchema, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadWholeFileResponse {
    pub transaction_id: Uuid,
}

#[derive(utoipa::ToSchema, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadChunkedResponse {
    pub transaction_id: Uuid,
    pub max_concurrent_uploads: u64,
    pub chunk_size: u64,
}

#[derive(utoipa::ToSchema, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyRangesResponse {
    pub transaction_id: Uuid,
    pub ranges: Vec<VerifyRange>,
}

#[derive(utoipa::ToSchema, serde::Serialize)]
#[serde(tag = "nextStep", content = "data", rename_all = "camelCase")]
pub enum UploadInitResponse {
    StartUploadChunked(UploadChunkedResponse),
    StartUploadWholeFile(UploadWholeFileResponse),
    VerifyRanges(VerifyRangesResponse),
}

#[derive(serde::Deserialize, utoipa::ToSchema)]
pub struct UploadVerifyDto {
    pub ranges: Vec<Vec<u8>>,
}

#[derive(serde::Serialize, utoipa::ToSchema)]
pub struct UploadVerifyResponse {
    pub blob_id: Option<Uuid>,
}

#[derive(serde::Serialize, utoipa::ToSchema)]
pub struct UploadCompleteResponse {
    pub success: bool,
    pub blob_id: Option<Uuid>,
    pub missing_chunks: Option<Vec<u64>>,
}
