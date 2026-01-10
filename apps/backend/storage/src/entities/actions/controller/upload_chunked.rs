use std::{env, io::SeekFrom, path::PathBuf};

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
    path = "/actions/upload/{transaction_id}",
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

    match meta.transaction_type {
        TransactionType::VerifyRanges { .. } => {
            return Err(ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                None,
                None,
            ));
        }
        TransactionType::ChunkedUpload | TransactionType::WholeFileUpload => {}
    }

    let (start, end) = content_range
        .bytes_range()
        .ok_or_else(|| ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidBody,
            None,
            Some("Missing Content-Range bytes".into()),
        ))?;

    let chunk_size = end - start;

    // Validate chunk size for chunked uploads
    if matches!(meta.transaction_type, TransactionType::ChunkedUpload) && chunk_size > 5 * 1024 * 1024 {
        return Err(ErrorResponse {
            error_code: "Chunk size is too large. Max chunk size is 5 MB".into(),
            error: "Payload too large".into(),
            status_code: 413,
            details: None,
            dev_details: None,
        });
    }

    // Validate whole file upload size
    if matches!(meta.transaction_type, TransactionType::WholeFileUpload) {
        let total_size = content_range.bytes_len();
        if total_size != Some(meta.size) || chunk_size != meta.size {
            return Err(ErrorResponse::bad_request(
                error_handlers::codes::BadRequestErrorCode::InvalidBody,
                None,
                Some("File size mismatch".into()),
            ));
        }
    }

    if body.len() != chunk_size as usize {
        return Err(ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidBody,
            None,
            Some("Content-Range header does not match body size".into()),
        ));
    }

    // Write to file
    let static_folder = env::var("STATIC_FOLDER_PATH")
        .map_err(|_| ErrorResponse::internal_server_error(Some("STATIC_FOLDER_PATH not set".into())))?;
    let path_to_file = PathBuf::from(format!("{}/{}", static_folder, transaction_id));

    if let Some(parent) = path_to_file.parent() {
        if !parent.exists() {
            tokio::fs::create_dir_all(parent)
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;
        }
    }

    let mut file = OpenOptions::new()
        .create(true)
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
