use std::path::{Component, Path, PathBuf};

use axum::{extract::Path as PathExtract};
use error_handlers::{codes, handlers::ErrorResponse};

fn is_safe_path(p: &Path) -> bool {
    !p.components()
        .any(|c| matches!(c, Component::ParentDir) || matches!(c, Component::RootDir))
}

#[utoipa::path(
    get,
    path = "/files/{path}",
    responses(
        (status = 200, description = "File found", body = String),
        (status = 404, description = "File not found", body = String),
    ),
    params(
        ("path" = String, Path, description = "Path to the file"),
    ),
    tag = "Files",
    operation_id = "get_file",
    security(
        ("auth" = [])
    )
)]
pub async fn get_file(
    PathExtract(path): PathExtract<PathBuf>,
) -> Result<(axum::http::StatusCode, axum::http::HeaderMap, axum::body::Body), ErrorResponse> {
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

    let mime = infer::get_from_path(&path_buf)
        .map_err(|_| ErrorResponse::internal_server_error())?
        .and_then(|mime| Some(mime.mime_type()))
        .unwrap_or("application/octet-stream");
    let mut headers = axum::http::HeaderMap::new();

    headers.insert(
        axum::http::header::CONTENT_TYPE,
        axum::http::HeaderValue::from_str(mime).unwrap(),
    );

    let file = tokio::fs::File::open(path_buf)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let body = tokio_util::io::ReaderStream::new(file);

    let stream = axum::body::Body::from_stream(body);

    Ok((axum::http::StatusCode::OK, headers, stream))
}
