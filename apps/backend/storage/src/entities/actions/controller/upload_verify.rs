use axum::{Json, extract::{Path, State}};
use error_handlers::handlers::ErrorResponse;
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
    pub blob_id: Option<String>,
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
    Json(_body): Json<UploadVerifyRequest>,
) -> Result<Json<UploadVerifyResponse>, ErrorResponse> {
    let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

    match meta.transaction_type {
        TransactionType::VerifyRanges { ranges: _ranges } => {
            // TODO: Implement verification logic:
            // 1. Read corresponding bytes from the existing blob file
            // 2. Compare with _body.ranges
            // 3. If match, return verified=true with blob_id
            // 4. If mismatch, delete transaction and return verified=false
            
            Ok(Json(UploadVerifyResponse {
                verified: false,
                blob_id: None,
            }))
        }
        TransactionType::ChunkedUpload | TransactionType::WholeFileUpload => {
            Err(ErrorResponse::bad_request(
                error_handlers::codes::BadRequestErrorCode::InvalidBody,
                None,
                Some("This transaction is not for verification".into()),
            ))
        }
    }
}
