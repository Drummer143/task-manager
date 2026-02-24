use axum::{Json, extract::Multipart, extract::State, http::StatusCode};
use error_handlers::handlers::ErrorResponse;
use sql::{blobs::model::Blob, shared::traits::PostgresqlRepositoryCreate};
use tokio::io::AsyncWriteExt;

use crate::{
    db::blobs::{BlobsRepository, CreateBlobDto},
    entities::actions::{service::ActionsService, shared::build_path_to_assets_file},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/internal/upload",
    request_body(
        content_type = "multipart/form-data",
    ),
    responses(
        (status = 201, description = "File uploaded successfully", body = Blob),
        (status = 400, description = "Invalid request", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Internal"],
)]
pub async fn upload(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<Blob>), ErrorResponse> {
    let mut file_bytes: Option<Vec<u8>> = None;
    let mut filename: Option<String> = None;

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidBody,
            None,
            Some(e.to_string()),
        )
    })? {
        let field_name = field.name().unwrap_or_default();

        match field_name {
            "file" => {
                filename = field.file_name().map(|s| s.to_string());

                let bytes = field.bytes().await.map_err(|e| {
                    ErrorResponse::bad_request(
                        error_handlers::codes::BadRequestErrorCode::InvalidBody,
                        None,
                        Some(e.to_string()),
                    )
                })?;

                file_bytes = Some(bytes.to_vec());
            }
            _ => {}
        }
    }

    let bytes = file_bytes.ok_or_else(|| {
        ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidBody,
            None,
            Some("Missing 'file' field".into()),
        )
    })?;

    let filename = filename.unwrap_or_else(|| "unknown".to_string());
    let hash = blake3::hash(&bytes).to_string();
    let size = bytes.len() as u64;

    // Deduplication: return existing blob if hash matches
    match BlobsRepository::get_one_by_hash(&state.postgres, &hash).await {
        Ok(blob) => return Ok((StatusCode::CREATED, Json(blob))),
        Err(sqlx::Error::RowNotFound) => {}
        Err(e) => return Err(ErrorResponse::internal_server_error(Some(e.to_string()))),
    }

    let mime_type = ActionsService::detect_mime_type(&bytes, &filename);
    let path_to_file = build_path_to_assets_file(&state.assets_folder_path, &hash, size);

    let mut file = tokio::fs::OpenOptions::new()
        .create(true)
        .truncate(true)
        .write(true)
        .open(&path_to_file)
        .await
        .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

    file.write_all(&bytes)
        .await
        .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

    let blob = BlobsRepository::create(
        &state.postgres,
        CreateBlobDto {
            hash,
            size: size as i64,
            path: path_to_file,
            mime_type,
        },
    )
    .await
    .map_err(|e| ErrorResponse::internal_server_error(Some(e.to_string())))?;

    Ok((StatusCode::CREATED, Json(blob)))
}