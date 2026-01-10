use std::path::PathBuf;

use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use uuid::Uuid;

use crate::{
    redis::{TransactionRepository, transaction::TransactionType},
    types::app_state::AppState,
};

#[derive(serde::Deserialize, utoipa::ToSchema)]
pub struct UploadVerifyRequest {
    pub ranges: Vec<Vec<u8>>,
}

#[derive(serde::Serialize, utoipa::ToSchema)]
pub struct UploadVerifyResponse {
    pub verified: bool,
    pub blob_id: Option<Uuid>,
}

#[utoipa::path(
    post,
    path = "/actions/upload/{transaction_id}/verify",
    request_body(
        content = UploadVerifyRequest,
        content_type = "application/json",
    ),
    responses(
        (status = 200, description = "Verification result", body = UploadVerifyResponse),
    ),
    tags = ["Upload file chunked"],
)]
pub async fn upload_verify(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
    Json(body): Json<UploadVerifyRequest>,
) -> Result<Json<UploadVerifyResponse>, ErrorResponse> {
    let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

    match meta.transaction_type {
        TransactionType::VerifyRanges { ranges } => {
            // Get existing blob path from DB
            let blob = sql::blobs::BlobsRepository::get_one_by_hash(&state.postgres, &meta.hash)
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            let path_to_file = PathBuf::from(&blob.path);

            let mut file = tokio::fs::File::open(&path_to_file)
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            let mut hasher = blake3::Hasher::new();

            for range in body.ranges {
                hasher.update(&range);
            }

            let incoming_hash = hasher.finalize().to_string();

            hasher.reset();

            for range in ranges {
                file.seek(std::io::SeekFrom::Start(range.start as u64))
                    .await
                    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                let range_size = range.end - range.start;

                let mut buf = vec![0u8; range_size as usize];

                file.read_exact(&mut buf)
                    .await
                    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                hasher.update(&buf);
            }

            let server_hash = hasher.finalize().to_string();

            let verified = incoming_hash == server_hash;

            if verified {
                TransactionRepository::delete(&state.redis, transaction_id).await?;

                Ok(Json(UploadVerifyResponse {
                    verified: true,
                    blob_id: Some(blob.id),
                }))
            } else {
                TransactionRepository::delete(&state.redis, transaction_id).await?;

                Err(ErrorResponse::unprocessable_entity(
                    error_handlers::codes::UnprocessableEntityErrorCode::ValidationErrors,
                    None,
                    Some("Verification failed".into()),
                ))
            }
        }
        TransactionType::ChunkedUpload { .. } | TransactionType::WholeFileUpload { .. } => {
            Err(ErrorResponse::bad_request(
                error_handlers::codes::BadRequestErrorCode::InvalidBody,
                None,
                Some("This transaction is not for verification".into()),
            ))
        }
    }
}
