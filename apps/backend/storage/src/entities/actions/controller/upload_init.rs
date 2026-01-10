use axum::{Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use rand::Rng;
use uuid::Uuid;

use crate::{
    redis::{TransactionRepository, transaction::{TransactionType, VerifyRange as RepoVerifyRange}},
    types::app_state::AppState,
};

#[derive(utoipa::ToSchema, serde::Deserialize, serde::Serialize)]
pub struct UploadChunkedInitRequest {
    pub hash: String,
    pub size: u64,
}

#[derive(utoipa::ToSchema, serde::Serialize)]
pub struct UploadResponse {
    pub transaction_id: Uuid,
}

#[derive(utoipa::ToSchema, serde::Serialize, Clone, serde::Deserialize)]
pub struct VerifyRange {
    pub start: i64,
    pub end: i64,
}

impl From<VerifyRange> for RepoVerifyRange {
    fn from(v: VerifyRange) -> Self {
        RepoVerifyRange {
            start: v.start,
            end: v.end,
        }
    }
}

impl From<RepoVerifyRange> for VerifyRange {
    fn from(v: RepoVerifyRange) -> Self {
        VerifyRange {
            start: v.start,
            end: v.end,
        }
    }
}

#[derive(utoipa::ToSchema, serde::Serialize, serde::Deserialize)]
pub struct VerifyRangesResponse {
    pub transaction_id: Uuid,
    pub ranges: Vec<VerifyRange>,
}

#[derive(utoipa::ToSchema, serde::Serialize)]
#[serde(tag = "next_step", content = "data", rename_all = "camelCase")]
pub enum UploadChunkedInitResponse {
    StartUploadChunked(UploadResponse),
    StartUploadWholeFile(UploadResponse),
    VerifyRanges(VerifyRangesResponse),
}

pub fn generate_challenge_ranges(
    file_size: i64,
    sample_count: i64,
    sample_size: i64,
) -> Vec<VerifyRange> {
    // If file is smaller than total check size, request the whole file
    let total_check_size = sample_size * sample_count;

    if file_size <= total_check_size {
        return vec![VerifyRange {
            start: 0,
            end: file_size,
        }];
    }

    let mut rng = rand::rng();
    let mut ranges = Vec::with_capacity(sample_count as usize);

    let max_start = file_size - sample_size;

    for _ in 0..sample_count {
        let start = rng.random_range(0..=max_start);

        ranges.push(VerifyRange {
            start,
            end: start + sample_size,
        });
    }

    // Sort ranges for sequential disk reads
    ranges.sort_by_key(|r| r.start);

    // Merge overlapping ranges
    let mut merged = Vec::new();

    let mut current = ranges[0].clone();

    for next_range in ranges.into_iter().skip(1) {
        if next_range.start <= current.end {
            current.end = std::cmp::max(current.end, next_range.end);
        } else {
            merged.push(current);
            current = next_range;
        }
    }

    merged.push(current);

    merged
}

#[utoipa::path(
    post,
    path = "/actions/upload/init",
    request_body(
        content = UploadChunkedInitRequest,
        content_type = "application/json",
    ),
    responses(
        (status = 200, description = "Upload chunked init", body = UploadChunkedInitResponse),
    ),
    tags = ["Upload file chunked"],
)]
#[axum_macros::debug_handler]
pub async fn upload_init(
    State(state): State<AppState>,
    Json(body): Json<UploadChunkedInitRequest>,
) -> Result<Json<UploadChunkedInitResponse>, ErrorResponse> {
    let blob: Result<sql::blobs::model::Blob, sqlx::Error> =
        sql::blobs::BlobsRepository::get_one_by_hash(&state.postgres, &body.hash)
            .await;

    match blob {
        Ok(blob) => {
            let transaction_id = Uuid::new_v4();
            let ranges = generate_challenge_ranges(blob.size, 10, 1024 * 1024);
            let repo_ranges: Vec<RepoVerifyRange> = ranges.iter().cloned().map(Into::into).collect();

            TransactionRepository::create(
                &state.redis,
                transaction_id,
                body.hash,
                body.size,
                TransactionType::VerifyRanges { ranges: repo_ranges },
            )
            .await?;

            Ok(Json(UploadChunkedInitResponse::VerifyRanges(
                VerifyRangesResponse {
                    transaction_id,
                    ranges,
                },
            )))
        }
        Err(sqlx::Error::RowNotFound) => {
            let transaction_id = Uuid::new_v4();

            // 5 MB threshold
            let (response, transaction_type) = if body.size > 5 * 1024 * 1024 {
                (
                    UploadChunkedInitResponse::StartUploadChunked(UploadResponse { transaction_id }),
                    TransactionType::ChunkedUpload,
                )
            } else {
                (
                    UploadChunkedInitResponse::StartUploadWholeFile(UploadResponse { transaction_id }),
                    TransactionType::WholeFileUpload,
                )
            };

            TransactionRepository::create(
                &state.redis,
                transaction_id,
                body.hash,
                body.size,
                transaction_type,
            )
            .await?;

            Ok(Json(response))
        }
        Err(error) => Err(ErrorResponse::from(error)),
    }
}
