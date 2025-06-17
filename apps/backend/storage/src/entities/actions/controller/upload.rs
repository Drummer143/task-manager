use axum::extract::Multipart;
use error_handlers::{codes, handlers::ErrorResponse};
use std::env;
use tokio::{fs::File, io::AsyncWriteExt};

use crate::entities::actions::dto::{UploadRequest, UploadResponse};

#[utoipa::path(
    post,
    path = "/actions/upload",
    request_body(
        content = UploadRequest,
        content_type = "multipart/form-data"
    ),
    responses(
        (status = 201, description = "File uploaded successfully", body = UploadResponse),
        (status = 400, description = "Invalid request body", body = ErrorResponse),
    ),
    tags = ["File"],
)]
pub async fn upload(mut multipart: Multipart) -> Result<UploadResponse, ErrorResponse> {
    tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;

    while let Ok(Some(field)) = multipart.next_field().await {
        if let Some(filename) = field.file_name() {
            let filename = filename.to_string();
            let file_path = format!("{}/{}", env::var("STATIC_FOLDER_PATH").unwrap(), filename);

            let mut file = File::create(&file_path)
                .await
                .map_err(|_| ErrorResponse::internal_server_error())?;

            // let mut file_size = 0usize;
            let mut stream = field;

            while let Ok(Some(chunk)) = stream.chunk().await {
                // file_size += chunk.len();

                if file.write_all(&chunk).await.is_err() {
                    let _ = tokio::fs::remove_file(&file_path).await;
                    return Err(ErrorResponse::internal_server_error());
                }
            }

            if file.flush().await.is_err() {
                let _ = tokio::fs::remove_file(&file_path).await;
                return Err(ErrorResponse::internal_server_error());
            }

            let link = format!(
                "http://{}:{}/files/{}",
                env::var("SELF_HOST").unwrap_or("localhost".to_string()),
                env::var("SELF_PORT").unwrap_or("8082".to_string()),
                filename,
            );

            return Ok(UploadResponse { link });
        }
    }

    Err(ErrorResponse::bad_request(
        codes::BadRequestErrorCode::InvalidBody,
        None,
    ))
}
