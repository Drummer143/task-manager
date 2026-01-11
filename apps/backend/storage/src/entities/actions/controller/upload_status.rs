use crate::{
    entities::actions::dto::{
        UploadChunkedStatusResponse, UploadStatusResponse, VerifyRangesStatusResponse,
    },
    redis::{TransactionRepository, transaction::TransactionType},
    types::app_state::AppState,
};
use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

#[utoipa::path(
    get,
    path = "/actions/upload/{transaction_id}/status",
    params(
        ("transaction_id", Path, description = "Transaction ID"),
    ),
    responses(
        (status = 200, description = "Upload status", body = UploadStatusResponse),
    ),
    tags = ["Upload file"],
)]
pub async fn upload_status(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Json<UploadStatusResponse>, ErrorResponse> {
    let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

    let response: UploadStatusResponse = match meta.transaction_type {
        TransactionType::ChunkedUpload { .. } => {
            let missing_chunks =
                TransactionRepository::get_all_missing_chunks(&state.redis, transaction_id).await?;

            if missing_chunks.is_empty() {
                UploadStatusResponse::Complete
            } else {
                UploadStatusResponse::UploadChunked(UploadChunkedStatusResponse {
                    missing_chunks: Some(missing_chunks),
                    max_concurrent_uploads: crate::redis::transaction::MAX_CONCURRENT_UPLOADS,
                    chunk_size: crate::redis::transaction::CHUNK_SIZE,
                })
            }
        }
        TransactionType::WholeFileUpload { .. } => UploadStatusResponse::UploadWholeFile,
        TransactionType::VerifyRanges { ranges } => {
            UploadStatusResponse::VerifyRanges(VerifyRangesStatusResponse { ranges })
        }
    };

    Ok(Json(response))
}
