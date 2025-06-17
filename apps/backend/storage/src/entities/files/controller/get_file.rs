use axum::{
    body::Body,
    extract::{Path as PathExtract, Request},
    http::{header, HeaderMap, HeaderValue, StatusCode},
};
use error_handlers::{codes, handlers::ErrorResponse};
use std::path::{Component, Path, PathBuf};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt};

fn is_safe_path(p: &Path) -> bool {
    !p.components()
        .any(|c| matches!(c, Component::ParentDir) || matches!(c, Component::RootDir))
}

#[utoipa::path(
    get,
    path = "/files/{path}",
    responses(
        (status = 200, description = "File found", body = String),
        (status = 206, description = "Partial content", body = String),
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
    request: Request,
) -> Result<(StatusCode, HeaderMap, Body), ErrorResponse> {
    println!("path: {}", path.display().to_string());
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

    if let Some(range_header) = request.headers().get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            if let Some(range) = parse_range_header(range_str, file_size) {
                return serve_partial_content(path_buf, range, file_size, headers).await;
            }
        }
    }

    headers.insert(
        header::CONTENT_LENGTH,
        HeaderValue::from_str(&file_size.to_string()).unwrap(),
    );
    headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    headers.insert(
        header::ACCESS_CONTROL_EXPOSE_HEADERS,
        HeaderValue::from_static("Content-Range, Content-Length, Accept-Ranges"),
    );
    headers.insert(
        header::ACCESS_CONTROL_ALLOW_ORIGIN,
        HeaderValue::from_static("http://localhost:1346"),
    );
    headers.insert(
        header::ACCESS_CONTROL_ALLOW_METHODS,
        HeaderValue::from_static("GET, HEAD, OPTIONS"),
    );
    headers.insert(
        header::ACCESS_CONTROL_ALLOW_HEADERS,
        HeaderValue::from_static("Range, Content-Type, Authorization"),
    );
    headers.insert(
        "X-Firefox-Spdy",
        HeaderValue::from_static("h2"),
    );

    let file = File::open(path_buf)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let body = Body::from_stream(tokio_util::io::ReaderStream::new(file));

    Ok((StatusCode::OK, headers, body))
}

#[derive(Debug)]
struct ByteRange {
    start: u64,
    end: u64,
}

fn parse_range_header(range_str: &str, file_size: u64) -> Option<ByteRange> {
    if !range_str.starts_with("bytes=") {
        return None;
    }

    let range_spec = &range_str[6..];
    let parts: Vec<&str> = range_spec.split('-').collect();

    if parts.len() != 2 {
        return None;
    }

    let start = if parts[0].is_empty() {
        if let Ok(suffix_length) = parts[1].parse::<u64>() {
            if suffix_length >= file_size {
                0
            } else {
                file_size - suffix_length
            }
        } else {
            return None;
        }
    } else if let Ok(start) = parts[0].parse::<u64>() {
        start
    } else {
        return None;
    };

    let end = if parts[1].is_empty() {
        file_size - 1
    } else if let Ok(end) = parts[1].parse::<u64>() {
        std::cmp::min(end, file_size - 1)
    } else {
        return None;
    };

    if start <= end && start < file_size {
        Some(ByteRange { start, end })
    } else {
        None
    }
}

async fn serve_partial_content(
    path_buf: PathBuf,
    range: ByteRange,
    file_size: u64,
    mut headers: HeaderMap,
) -> Result<(StatusCode, HeaderMap, Body), ErrorResponse> {
    let mut file = File::open(path_buf)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    file.seek(std::io::SeekFrom::Start(range.start))
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let content_length = range.end - range.start + 1;

    headers.insert(
        header::CONTENT_LENGTH,
        HeaderValue::from_str(&content_length.to_string()).unwrap(),
    );
    headers.insert(
        header::CONTENT_RANGE,
        HeaderValue::from_str(&format!(
            "bytes {}-{}/{}",
            range.start, range.end, file_size
        ))
        .unwrap(),
    );
    headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));

    let mut buffer = vec![0; content_length as usize];
    file.read_exact(&mut buffer)
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    let body = Body::from(buffer);

    Ok((StatusCode::PARTIAL_CONTENT, headers, body))
}
