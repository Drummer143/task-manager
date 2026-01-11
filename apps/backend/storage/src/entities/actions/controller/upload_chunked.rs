use std::io::SeekFrom;

use axum::{
    body::Bytes,
    extract::{Path, State},
};
use axum_extra::TypedHeader;
use error_handlers::handlers::ErrorResponse;
use tokio::{
    fs::OpenOptions,
    io::{AsyncSeekExt, AsyncWriteExt},
};
use uuid::Uuid;

use crate::{
    redis::{TransactionRepository, transaction::TransactionType},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/actions/upload/{transaction_id}/chunk",
    params(
        ("transaction_id" = Uuid, Path, description = "Transaction id"),
        ("Content-Range" = String, Header, description = "Format: bytes start-end/total (e.g. bytes 0-1024/5000)"),
        ("Content-Type" = String, Header, example = "application/octet-stream")
    ),
    request_body(
        content = Vec<u8>,
        content_type = "application/octet-stream",
    ),
    responses(
        (status = 201, description = "File uploaded successfully")
    ),
    tags = ["Upload file chunked"],
)]
pub async fn upload_chunked(
    State(state): State<AppState>,
    TypedHeader(content_range): TypedHeader<axum_extra::headers::ContentRange>,
    Path(transaction_id): Path<Uuid>,
    body: Bytes,
) -> Result<(), ErrorResponse> {
    let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

    if !matches!(meta.transaction_type, TransactionType::ChunkedUpload { .. }) {
        return Err(ErrorResponse::conflict(
            error_handlers::codes::ConflictErrorCode::WrongStep,
            None,
            Some(format!("Current step: {:?}", meta.transaction_type)),
        ));
    }

    // Try to acquire upload slot (limit concurrent uploads)
    let acquired =
        TransactionRepository::try_acquire_upload_slot(&state.redis, transaction_id).await?;

    if !acquired {
        return Err(ErrorResponse {
            error_code: "too_many_concurrent_uploads".into(),
            error: "Too many concurrent uploads for this transaction".into(),
            status_code: 429,
            details: None,
            dev_details: None,
        });
    }

    // Ensure slot is released on any exit path
    let result = upload_chunk_inner(&state, &meta, transaction_id, content_range, body).await;

    TransactionRepository::release_upload_slot(&state.redis, transaction_id).await?;

    result
}

async fn upload_chunk_inner(
    state: &AppState,
    meta: &crate::redis::transaction::TransactionMeta,
    transaction_id: Uuid,
    content_range: axum_extra::headers::ContentRange,
    body: Bytes,
) -> Result<(), ErrorResponse> {
    let (start, end) = content_range.bytes_range().ok_or_else(|| {
        ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidBody,
            None,
            Some("Missing Content-Range bytes".into()),
        )
    })?;

    let chunk_size = end - start;

    let path_to_file = match &meta.transaction_type {
        TransactionType::ChunkedUpload { path_to_file } => path_to_file,
        _ => unreachable!(),
    };

    // Validate chunk size for chunked uploads
    if chunk_size > crate::redis::transaction::CHUNK_SIZE || body.len() != chunk_size as usize {
        return Err(ErrorResponse {
            error_code: "Chunk size is too large. Max chunk size is 5 MB".into(),
            error: "Payload too large".into(),
            status_code: 413,
            details: None,
            dev_details: None,
        });
    }

    let mut file = OpenOptions::new()
        .write(true)
        .open(&path_to_file)
        .await
        .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

    if start > 0 {
        file.seek(SeekFrom::Start(start))
            .await
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;
    }

    file.write_all(&body)
        .await
        .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

    // Mark chunk as uploaded
    let chunk_index = TransactionRepository::chunk_index_from_offset(start);
    TransactionRepository::set_chunk_uploaded(&state.redis, transaction_id, chunk_index).await?;

    Ok(())
}
