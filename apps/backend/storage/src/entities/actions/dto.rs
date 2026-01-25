use serde::{Deserialize, Serialize};
use sqlx::types::chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::redis::transaction::VerifyRange;

#[derive(utoipa::ToSchema, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadInitDto {
    pub upload_token: String,
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
#[serde(rename_all = "camelCase")]
pub struct UploadVerifyResponse {
    pub blob_id: Uuid,
}

#[derive(serde::Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UploadChunkedStatusResponse {
    pub max_concurrent_uploads: u64,
    pub chunk_size: u64,
    pub missing_chunks: Option<Vec<u64>>,
}

#[derive(serde::Serialize, utoipa::ToSchema)]
pub struct VerifyRangesStatusResponse {
    pub ranges: Vec<VerifyRange>,
}

#[derive(serde::Serialize, utoipa::ToSchema)]
#[serde(tag = "currentStep", content = "data", rename_all = "camelCase")]
pub enum UploadStatusResponse {
    UploadChunked(UploadChunkedStatusResponse),
    UploadWholeFile,
    VerifyRanges(VerifyRangesStatusResponse),
    Complete,
}

#[derive(Deserialize)]
pub struct UploadToken {
    pub sub: Uuid,
    pub exp: usize,
    pub name: String,
    pub entity_id: Uuid,
    pub entity_type: String,
}

#[derive(Serialize, Deserialize, utoipa::ToSchema)]
pub struct AssetResponse {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
}
