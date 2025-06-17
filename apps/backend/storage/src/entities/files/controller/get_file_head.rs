use axum::{
    extract::{Path as PathExtract},
    http::{header, HeaderMap, HeaderValue, StatusCode},
};
use error_handlers::{codes, handlers::ErrorResponse};
use std::path::{Component, PathBuf};

fn is_safe_path(p: &PathBuf) -> bool {
    !p.components()
        .any(|c| matches!(c, Component::ParentDir) || matches!(c, Component::RootDir))
}

#[utoipa::path(
    head,
    path = "/files/{path}",
    responses(
        (status = 200, description = "File info"),
    ),
    params(
        ("path" = String, Path, description = "Path to the file"),
    ),
    tag = "Files"
)]
pub async fn head_file(
    PathExtract(path): PathExtract<PathBuf>,
) -> Result<(StatusCode, HeaderMap), ErrorResponse> {
    let user_path = PathBuf::from(path);
    if !is_safe_path(&user_path) {
        return Err(ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::AccessDenied,
            None,
        ));
    }

    let static_folder_path = std::env::var("STATIC_FOLDER_PATH").unwrap_or("./static".to_string());
    let path_buf = PathBuf::from(static_folder_path).join(&user_path);

    if !path_buf.exists() {
        return Err(ErrorResponse::not_found(
            codes::NotFoundErrorCode::NotFound,
            None,
        ));
    }

    let metadata = tokio::fs::metadata(&path_buf)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let file_size = metadata.len();
    let mime = infer::get_from_path(&path_buf)
        .map_err(|_| ErrorResponse::internal_server_error())?
        .and_then(|mime| Some(mime.mime_type()))
        .unwrap_or("application/octet-stream");

    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, HeaderValue::from_str(mime).unwrap());
    headers.insert(
        header::CONTENT_LENGTH,
        HeaderValue::from_str(&file_size.to_string()).unwrap(),
    );
    headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));

    // CORS для Firefox
    headers.insert(
        header::ACCESS_CONTROL_ALLOW_ORIGIN,
        HeaderValue::from_static("http://localhost:1346"),
    );
    headers.insert(
        header::ACCESS_CONTROL_EXPOSE_HEADERS,
        HeaderValue::from_static("Content-Range, Content-Length, Accept-Ranges"),
    );

    Ok((StatusCode::OK, headers))
}
