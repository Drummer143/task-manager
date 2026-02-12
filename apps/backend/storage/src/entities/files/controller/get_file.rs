use axum::{
    Extension,
    body::Body,
    extract::{Path as PathExtract, Query, Request, State},
    http::{HeaderMap, HeaderValue, StatusCode, header},
};
use error_handlers::{codes, handlers::ErrorResponse};
use serde::Deserialize;
use sql::shared::traits::PostgresqlRepositoryGetOneById;
use std::{path::PathBuf, str};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use uuid::Uuid;

use crate::types::app_state::AppState;

#[derive(Deserialize)]
pub struct QueryParams {
    pub filename: Option<String>,
}

#[utoipa::path(
    get,
    path = "/files/{asset_id}",
    responses(
        (status = 200, description = "File found", body = String),
        (status = 206, description = "Partial content", body = String),
        (status = 404, description = "File not found", body = String),
    ),
    params(
        ("asset_id" = Uuid, Path, description = "Asset ID"),
        ("filename" = Option<String>, Query, description = "File name"),
    ),
    tag = "Files",
    operation_id = "get_file",
)]
pub async fn get_file(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    PathExtract(asset_id): PathExtract<Uuid>,
    Query(query): Query<QueryParams>,
    request: Request,
) -> Result<(StatusCode, HeaderMap, Body), ErrorResponse> {
    let response = validate_access(&state.main_service_url, user_id, asset_id).await?;

    let blob = sql::blobs::BlobsRepository::get_one_by_id(&state.postgres, response.blob_id)
        .await
        .map_err(ErrorResponse::from)?;

    let blob_path = PathBuf::from(blob.path);

    if !blob_path.exists() {
        return Err(ErrorResponse::not_found(
            codes::NotFoundErrorCode::NotFound,
            None,
            None,
        ));
    }

    let metadata = tokio::fs::metadata(&blob_path)
        .await
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

    let file_size = metadata.len();

    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        HeaderValue::from_str(&blob.mime_type).unwrap(),
    );

    if let Some(range_header) = request.headers().get(header::RANGE)
        && let Ok(range_str) = range_header.to_str()
        && let Some(range) = parse_range_header(range_str, file_size)
    {
        return serve_partial_content(blob_path, range, file_size, headers).await;
    }

    let file_name = query.filename.unwrap_or(response.name);

    headers.insert(
        header::CONTENT_LENGTH,
        HeaderValue::from_str(&file_size.to_string()).unwrap(),
    );
    headers.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    headers.insert(
        header::CONTENT_DISPOSITION,
        HeaderValue::from_str(&format!("attachment; filename={}", file_name)).unwrap(),
    );

    let file = File::open(&blob_path)
        .await
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

    let body = Body::from_stream(tokio_util::io::ReaderStream::new(file));

    Ok((StatusCode::OK, headers, body))
}

#[derive(Deserialize)]
struct ValidateAccessResponse {
    blob_id: Uuid,
    name: String,
}

async fn validate_access(
    main_service_url: &str,
    user_id: Uuid,
    asset_id: Uuid,
) -> Result<ValidateAccessResponse, ErrorResponse> {
    let resp = reqwest::Client::new()
        .get(format!("{}/assets/{}/blob-id", main_service_url, asset_id))
        .header("x-user-id", user_id.to_string())
        .send()
        .await
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

    if resp.status() == reqwest::StatusCode::OK {
        resp.json::<ValidateAccessResponse>()
            .await
            .map_err(|error| ErrorResponse::internal_server_error(Some(error.to_string())))
    } else {
        match resp.json::<ErrorResponse>().await {
            Ok(error) => Err(error),
            Err(error) => Err(ErrorResponse::internal_server_error(Some(
                error.to_string(),
            ))),
        }
    }
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
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

    file.seek(std::io::SeekFrom::Start(range.start))
        .await
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

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
        .map_err(|_| ErrorResponse::internal_server_error(None))?;

    let body = Body::from(buffer);

    Ok((StatusCode::PARTIAL_CONTENT, headers, body))
}
