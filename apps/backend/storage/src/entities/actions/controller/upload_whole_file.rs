use axum::{
    Json,
    body::Bytes,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use sql::shared::traits::PostgresqlRepositoryCreate;
use tokio::{fs::OpenOptions, io::AsyncWriteExt};
use uuid::Uuid;

use crate::{
    entities::actions::{
        controller::upload_complete::UploadCompleteResponse, shared::build_path_to_assets_file,
    },
    redis::{TransactionRepository, transaction::TransactionType},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/actions/upload/{transaction_id}/whole-file",
    request_body(
        content = Vec<u8>,
        content_type = "application/octet-stream"
    ),
    responses(
        (status = 201, description = "File uploaded successfully"),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
    ),
    tags = ["Upload file"],
)]
pub async fn upload_whole_file(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
    body: Bytes,
) -> Result<Json<UploadCompleteResponse>, ErrorResponse> {
    let meta = TransactionRepository::get(&state.redis, transaction_id).await?;

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

    let blob = match sql::blobs::BlobsRepository::get_one_by_hash(&state.postgres, &hash).await {
        Ok(blob) => Ok(Some(blob)),
        Err(e) => match e {
            sqlx::Error::RowNotFound => Ok(None),
            _ => Err(ErrorResponse::from(e)),
        },
    }?;

    if let Some(blob) = blob {
        return Ok(Json(UploadCompleteResponse {
            success: true,
            blob_id: Some(blob.id),
            missing_chunks: None,
        }));
    }

    let path_to_file = match meta.transaction_type {
        TransactionType::ChunkedUpload { path_to_file } => Ok(build_path_to_assets_file(
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

    Ok(Json(UploadCompleteResponse {
        success: true,
        blob_id: Some(blob.id),
        missing_chunks: None,
    }))
}
