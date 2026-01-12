use std::{collections::HashMap, io::SeekFrom};

use axum::body::Bytes;
use error_handlers::handlers::ErrorResponse;
use rand::Rng;
use sql::shared::traits::PostgresqlRepositoryCreate;
use tokio::{
    fs::OpenOptions,
    io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt},
};
use uuid::Uuid;

use crate::{
    entities::actions::{
        dto::{
            UploadChunkedResponse, UploadChunkedStatusResponse, UploadCompleteResponse,
            UploadInitDto, UploadInitResponse, UploadStatusResponse, UploadVerifyDto,
            UploadVerifyResponse, UploadWholeFileResponse, VerifyRangesResponse,
            VerifyRangesStatusResponse,
        },
        shared::{build_path_to_assets_file, build_path_to_temp_file},
    },
    redis::{
        TransactionRepository,
        transaction::{TransactionType, VerifyRange},
    },
    types::app_state::AppState,
};

pub struct ActionsService;

impl ActionsService {
    fn generate_challenge_ranges(
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

    pub async fn upload_init(
        state: &AppState,
        body: UploadInitDto,
    ) -> Result<UploadInitResponse, ErrorResponse> {
        let blob = sql::blobs::BlobsRepository::get_one_by_hash(&state.postgres, &body.hash).await;

        match blob {
            Ok(blob) => {
                let transaction_id: Uuid = Uuid::new_v4();
                let ranges = Self::generate_challenge_ranges(blob.size, 10, 1024 * 1024);
                let repo_ranges: Vec<VerifyRange> = ranges.iter().cloned().collect();

                TransactionRepository::create(
                    &state.redis,
                    transaction_id,
                    body.hash,
                    body.size,
                    TransactionType::VerifyRanges {
                        ranges: repo_ranges,
                    },
                )
                .await?;

                Ok(UploadInitResponse::VerifyRanges(VerifyRangesResponse {
                    transaction_id,
                    ranges,
                }))
            }
            Err(sqlx::Error::RowNotFound) => {
                let transaction_id = Uuid::new_v4();

                let path_to_file =
                    build_path_to_temp_file(&state.temp_folder_path, &transaction_id);

                let file = tokio::fs::File::create(&path_to_file)
                    .await
                    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                if let Err(error) = file.set_len(body.size).await {
                    if error.kind() == std::io::ErrorKind::OutOfMemory {
                        return Err(ErrorResponse {
                            status_code: 507,
                            error_code: "out_of_memory".into(),
                            error: "Out of memory".into(),
                            details: None,
                            dev_details: None,
                        });
                    }

                    return Err(ErrorResponse::internal_server_error(Some(
                        error.to_string(),
                    )));
                }

                let (response, transaction_type) =
                    if body.size > crate::redis::transaction::CHUNK_SIZE * 3 {
                        (
                            UploadInitResponse::StartUploadChunked(UploadChunkedResponse {
                                transaction_id,
                                max_concurrent_uploads:
                                    crate::redis::transaction::MAX_CONCURRENT_UPLOADS,
                                chunk_size: crate::redis::transaction::CHUNK_SIZE,
                            }),
                            TransactionType::ChunkedUpload {
                                path_to_file: path_to_file.clone(),
                            },
                        )
                    } else {
                        (
                            UploadInitResponse::StartUploadWholeFile(UploadWholeFileResponse {
                                transaction_id,
                            }),
                            TransactionType::WholeFileUpload {
                                path_to_file: path_to_file.clone(),
                            },
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

                Ok(response)
            }
            Err(error) => Err(ErrorResponse::from(error)),
        }
    }

    pub async fn upload_verify(
        state: &AppState,
        transaction_id: Uuid,
        body: UploadVerifyDto,
    ) -> Result<UploadVerifyResponse, ErrorResponse> {
        let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

        match meta.transaction_type {
            TransactionType::ChunkedUpload { .. } | TransactionType::WholeFileUpload { .. } => {
                Err(ErrorResponse::bad_request(
                    error_handlers::codes::BadRequestErrorCode::InvalidBody,
                    None,
                    Some("This transaction is not for verification".into()),
                ))
            }
            TransactionType::VerifyRanges { ranges } => {
                // Get existing blob path from DB
                let blob =
                    sql::blobs::BlobsRepository::get_one_by_hash(&state.postgres, &meta.hash)
                        .await
                        .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                let mut file = tokio::fs::File::open(&blob.path)
                    .await
                    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

                let mut hasher = blake3::Hasher::new();

                for range in body.ranges {
                    hasher.update(&range);
                }

                let client_hash = hasher.finalize().to_string();

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

                if client_hash == server_hash {
                    TransactionRepository::delete(&state.redis, transaction_id).await?;

                    Ok(UploadVerifyResponse {
                        blob_id: blob.id,
                    })
                } else {
                    TransactionRepository::delete(&state.redis, transaction_id).await?;

                    Err(ErrorResponse::unprocessable_entity(
                        error_handlers::codes::UnprocessableEntityErrorCode::ValidationErrors,
                        None,
                        Some("Verification failed".into()),
                    ))
                }
            }
        }
    }

    pub async fn upload_whole_file(
        state: &AppState,
        transaction_id: Uuid,
        body: Bytes,
    ) -> Result<UploadCompleteResponse, ErrorResponse> {
        let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

        let path_to_file = match meta.transaction_type {
            TransactionType::WholeFileUpload { path_to_file } => Ok(build_path_to_assets_file(
                &path_to_file,
                &meta.hash,
                meta.size,
            )),
            _ => Err(ErrorResponse::conflict(
                error_handlers::codes::ConflictErrorCode::WrongStep,
                None,
                Some(format!("Current step: {:?}", meta.transaction_type)),
            )),
        }?;

        if body.len() as u64 != meta.size {
            return Err(ErrorResponse::bad_request(
                error_handlers::codes::BadRequestErrorCode::InvalidBody,
                None,
                Some("Invalid file".into()),
            ));
        }

        if body.len() > 15 * 1024 * 1024 {
            return Err(ErrorResponse {
                error_code: "File too large".into(),
                error: "File too large".into(),
                status_code: 413,
                details: None,
                dev_details: None,
            });
        }

        let hash = blake3::hash(&body).to_string();

        if hash != meta.hash {
            return Err(ErrorResponse::unprocessable_entity(
                error_handlers::codes::UnprocessableEntityErrorCode::ValidationErrors,
                None,
                Some("Invalid file hash".into()),
            ));
        }

        let blob = match sql::blobs::BlobsRepository::get_one_by_hash(&state.postgres, &hash).await
        {
            Ok(blob) => Ok(Some(blob)),
            Err(e) => match e {
                sqlx::Error::RowNotFound => Ok(None),
                _ => Err(ErrorResponse::from(e)),
            },
        }?;

        if let Some(blob) = blob {
            return Ok(UploadCompleteResponse { blob_id: blob.id });
        }

        let mut file = OpenOptions::new()
            .write(true)
            .open(&path_to_file)
            .await
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

        file.write_all(&body)
            .await
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

        let blob = sql::blobs::BlobsRepository::create(
            &state.postgres,
            sql::blobs::dto::CreateBlobDto {
                hash: hash,
                size: meta.size as i64,
                path: path_to_file,
                mime_type: "application/octet-stream".into(),
            },
        )
        .await?;

        TransactionRepository::delete(&state.redis, transaction_id).await?;

        Ok(UploadCompleteResponse { blob_id: blob.id })
    }

    async fn upload_chunk_inner(
        state: &AppState,
        meta: &crate::redis::transaction::TransactionMeta,
        transaction_id: Uuid,
        chunk_start: u64,
        body: Bytes,
    ) -> Result<(), ErrorResponse> {
        let path_to_file = match &meta.transaction_type {
            TransactionType::ChunkedUpload { path_to_file } => path_to_file,
            _ => unreachable!(),
        };

        let mut file = OpenOptions::new()
            .write(true)
            .open(&path_to_file)
            .await
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

        if chunk_start > 0 {
            file.seek(SeekFrom::Start(chunk_start))
                .await
                .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;
        }

        file.write_all(&body)
            .await
            .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

        // Mark chunk as uploaded
        let chunk_index = TransactionRepository::chunk_index_from_offset(chunk_start);
        TransactionRepository::set_chunk_uploaded(&state.redis, transaction_id, chunk_index)
            .await?;

        Ok(())
    }

    pub async fn upload_chunk(
        state: &AppState,
        transaction_id: Uuid,
        bytes_range: (u64, u64),
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

        let (start, end) = bytes_range;

        let chunk_size = end - start;

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
        let result = Self::upload_chunk_inner(&state, &meta, transaction_id, start, body).await;

        TransactionRepository::release_upload_slot(&state.redis, transaction_id).await?;

        result
    }

    pub async fn upload_status(
        state: &AppState,
        transaction_id: Uuid,
    ) -> Result<UploadStatusResponse, ErrorResponse> {
        let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

        let response = match meta.transaction_type {
            TransactionType::ChunkedUpload { .. } => {
                let missing_chunks =
                    TransactionRepository::get_all_missing_chunks(&state.redis, transaction_id)
                        .await?;

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

        Ok(response)
    }

    pub async fn upload_cancel(
        state: &AppState,
        transaction_id: Uuid,
    ) -> Result<(), ErrorResponse> {
        let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

        // Delete temp file if it exists
        if let TransactionType::ChunkedUpload { path_to_file }
        | TransactionType::WholeFileUpload { path_to_file } = meta.transaction_type
        {
            if let Err(e) = tokio::fs::remove_file(&path_to_file).await {
                // Ignore NotFound errors - file may not have been created yet
                if e.kind() != std::io::ErrorKind::NotFound {
                    return Err(ErrorResponse::internal_server_error(Some(e.to_string())));
                }
            }
        }

        TransactionRepository::delete(&state.redis, transaction_id).await?;

        Ok(())
    }

    pub async fn upload_complete(
        state: &AppState,
        transaction_id: Uuid,
    ) -> Result<UploadCompleteResponse, ErrorResponse> {
        let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

        match meta.transaction_type {
            TransactionType::VerifyRanges { .. } => {
                return Err(ErrorResponse::forbidden(
                    error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                    None,
                    None,
                ));
            }
            TransactionType::ChunkedUpload {
                path_to_file: path_to_temp_file,
            }
            | TransactionType::WholeFileUpload {
                path_to_file: path_to_temp_file,
            } => {
                // Check if all chunks are uploaded
                let is_complete =
                    TransactionRepository::is_upload_complete(&state.redis, transaction_id).await?;

                if !is_complete {
                    return Err(ErrorResponse::forbidden(
                        error_handlers::codes::ForbiddenErrorCode::AccessDenied,
                        Some(HashMap::from([(
                            "details".to_string(),
                            "Upload is not complete".to_string(),
                        )])),
                        None,
                    ));
                }

                // Use mmap + rayon for parallel hashing (much faster for large files)
                let path_clone = path_to_temp_file.clone();
                let hash =
                    tokio::task::spawn_blocking(move || -> Result<String, std::io::Error> {
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

                Ok(UploadCompleteResponse { blob_id: blob.id })
            }
        }
    }
}
