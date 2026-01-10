use std::{env, path::PathBuf};

use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use sql::shared::traits::PostgresqlRepositoryCreate;
use tokio::io::AsyncReadExt;
use uuid::Uuid;

use crate::{
    redis::{TransactionRepository, transaction::TransactionType},
    types::app_state::AppState,
};

#[derive(serde::Serialize, utoipa::ToSchema)]
pub struct UploadCompleteResponse {
    pub success: bool,
    pub blob_id: Option<Uuid>,
    pub missing_chunks: Option<Vec<u64>>,
}

#[utoipa::path(
    post,
    path = "/actions/upload/{transaction_id}/complete",
    params(
        ("transaction_id", Path, description = "Transaction ID"),
    ),
    responses(
        (status = 200, description = "Upload completion result", body = UploadCompleteResponse),
    ),
    tags = ["Upload file chunked"],
)]
pub async fn upload_complete(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Json<UploadCompleteResponse>, ErrorResponse> {
    let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

    match meta.transaction_type {
        TransactionType::VerifyRanges { .. } => {
            return Err(ErrorResponse::forbidden(
                error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                None,
                None,
            ));
        }
        TransactionType::ChunkedUpload | TransactionType::WholeFileUpload => {
            // Check if all chunks are uploaded
            let is_complete =
                TransactionRepository::is_upload_complete(&state.redis, transaction_id).await?;

            if !is_complete {
                let first_missing =
                    TransactionRepository::get_first_missing_chunk(&state.redis, transaction_id)
                        .await?;
                return Ok(Json(UploadCompleteResponse {
                    success: false,
                    blob_id: None,
                    missing_chunks: first_missing.map(|idx| vec![idx]),
                }));
            }

            let static_folder = env::var("STATIC_FOLDER_PATH").map_err(|_| {
                ErrorResponse::internal_server_error(Some("STATIC_FOLDER_PATH not set".into()))
            })?;
            let path_to_file = PathBuf::from(format!("{}/{}", static_folder, transaction_id));

            let mut file = tokio::fs::File::open(&path_to_file)
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            let mut buf = [0u8; 8192];

            let mut hasher = blake3::Hasher::new();

            loop {
                let read_bytes = file
                    .read(&mut buf)
                    .await
                    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                if read_bytes == 0 {
                    break;
                }

                hasher.update(&buf[..read_bytes]);
            }

            let hash = hasher.finalize().to_string();

            if meta.hash != hash {
                tokio::fs::remove_file(&path_to_file)
                    .await
                    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                TransactionRepository::delete(&state.redis, transaction_id).await?;

                return Err(ErrorResponse::unprocessable_entity(
                    error_handlers::codes::UnprocessableEntityErrorCode::ValidationErrors,
                    None,
                    Some("File hash mismatch".into()),
                ));
            }

            TransactionRepository::delete(&state.redis, transaction_id).await?;

            let size = file
                .metadata()
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?
                .len() as i64;

            let blob = sql::blobs::BlobsRepository::create(
                &state.postgres,
                sql::blobs::dto::CreateBlobDto {
                    hash,
                    size,
                    mime_type: "asd".into(),
                    path: path_to_file.to_str().unwrap().to_string(),
                },
            )
            .await
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            Ok(Json(UploadCompleteResponse {
                success: true,
                blob_id: Some(blob.id),
                missing_chunks: None,
            }))
        }
    }
}
