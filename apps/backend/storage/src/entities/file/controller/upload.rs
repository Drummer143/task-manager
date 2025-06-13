use axum::extract::Multipart;
use error_handlers::{codes, handlers::ErrorResponse};
use std::{collections::HashMap, env, path::PathBuf};
use tokio::{fs, io::AsyncWriteExt};
use uuid::Uuid;

use crate::entities::file::dto::{UploadRequest, UploadResponse};

fn sanitize_folder(input: &str) -> Option<String> {
    let valid = input
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-');

    if valid && !input.contains("..") && !input.contains('/') && !input.contains('\\') {
        Some(input.to_string())
    } else {
        None
    }
}

#[utoipa::path(
    post,
    path = "/files/upload",
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
    let mut folder = String::from("common");
    let mut file_bytes = None;
    let mut original_filename = None;

    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap_or("").to_string();
        match name.as_str() {
            "file" => {
                original_filename = field.file_name().map(|s| s.to_string());
                file_bytes = Some(field.bytes().await.unwrap());
            }
            "folder" => {
                folder = field
                    .text()
                    .await
                    .map(|s| sanitize_folder(&s).unwrap_or("common".to_string()))
                    .unwrap_or("common".to_string());
            }
            _ => {}
        }
    }

    if file_bytes.is_none() {
        return Err(ErrorResponse::bad_request(
            codes::BadRequestErrorCode::InvalidBody,
            Some(HashMap::from([(
                "message".to_string(),
                "Missing file".to_string(),
            )])),
        ));
    }

    let bytes = file_bytes.unwrap();
    let orig_name = PathBuf::from(original_filename.unwrap_or("common".to_string()));
    let ext = orig_name.extension().and_then(|e| e.to_str());

    let filename = if ext.is_none() {
        Uuid::new_v4().to_string()
    } else {
        format!("{}.{}", Uuid::new_v4(), ext.unwrap())
    };

    let static_path = env::var("STATIC_FOLDER_PATH").unwrap_or("./static".to_string());
    let mut path = if folder.is_empty() {
        static_path
    } else {
        format!("{}/{}", static_path, folder)
    };
    path = path.replace("//", "/").replace("\\\\", "\\");

    fs::create_dir_all(&path)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    path = format!("{}/{}", path, filename);

    let mut file = fs::File::create(&path)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    file.write_all(&bytes)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let scheme = "http";
    let host = env::var("SELF_HOST")
        .ok()
        .unwrap_or("localhost".to_string());
    let port = env::var("SELF_PORT").ok().unwrap_or("8082".to_string());

    let path_part = if folder.is_empty() {
        format!("{filename}")
    } else {
        format!("{folder}/{filename}")
    };

    Ok(UploadResponse {
        link: format!("{scheme}://{host}:{port}/files/{path_part}"),
    })
}
