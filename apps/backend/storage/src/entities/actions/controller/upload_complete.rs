use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use sql::shared::traits::PostgresqlRepositoryCreate;
use uuid::Uuid;

use crate::{
    entities::actions::shared::build_path_to_assets_file,
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
        TransactionType::ChunkedUpload { .. } | TransactionType::WholeFileUpload { .. } => {
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

            let path_to_temp_file = match meta.transaction_type {
                TransactionType::ChunkedUpload { path_to_file } => path_to_file,
                TransactionType::WholeFileUpload { path_to_file } => path_to_file,
                _ => unreachable!(),
            };

            // Use mmap + rayon for parallel hashing (much faster for large files)
            let path_clone = path_to_temp_file.clone();
            let hash = tokio::task::spawn_blocking(move || -> Result<String, std::io::Error> {
                let file = std::fs::File::open(&path_clone)?;
                let mmap = unsafe { memmap2::Mmap::map(&file)? };
                let hash = blake3::Hasher::new()
                    .update_rayon(&mmap)
                    .finalize()
                    .to_string();
                Ok(hash)
            })
            .await
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            if meta.hash != hash {
                tokio::fs::remove_file(&path_to_temp_file)
                    .await
                    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                TransactionRepository::delete(&state.redis, transaction_id).await?;

                return Err(ErrorResponse::unprocessable_entity(
                    error_handlers::codes::UnprocessableEntityErrorCode::ValidationErrors,
                    None,
                    Some("File hash mismatch".into()),
                ));
            }

            let path_to_asset_file =
                build_path_to_assets_file(&state.assets_folder_path, &hash, meta.size);

            tokio::fs::rename(&path_to_temp_file, &path_to_asset_file)
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

            TransactionRepository::delete(&state.redis, transaction_id).await?;

            let blob = sql::blobs::BlobsRepository::create(
                &state.postgres,
                sql::blobs::dto::CreateBlobDto {
                    hash,
                    size: meta.size.try_into().unwrap(),
                    mime_type: "asd".into(),
                    path: path_to_asset_file,
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
