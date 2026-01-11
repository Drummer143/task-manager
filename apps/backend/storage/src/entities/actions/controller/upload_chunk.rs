use axum::{
    body::Bytes,
    extract::{Path, State},
};
use axum_extra::TypedHeader;
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{entities::actions::service::ActionsService, types::app_state::AppState};

#[utoipa::path(
    post,
    path = "/actions/upload/{transaction_id}/chunk",
    params(
        ("transaction_id" = Uuid, Path, description = "Transaction id"),
        ("Content-Range" = String, Header, description = "Format: bytes start-end/total (e.g. bytes 0-1024/5000)"),
        ("Content-Type" = String, Header, example = "application/octet-stream")
    ),
    request_body(
        content = Vec<u8>,
        content_type = "application/octet-stream",
    ),
    responses(
        (status = 201, description = "File uploaded successfully")
    ),
    tags = ["Upload file"],
)]
pub async fn upload_chunk(
    State(state): State<AppState>,
    TypedHeader(content_range): TypedHeader<axum_extra::headers::ContentRange>,
    Path(transaction_id): Path<Uuid>,
    body: Bytes,
) -> Result<(), ErrorResponse> {
    let bytes_range = content_range.bytes_range().ok_or_else(|| {
        ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidBody,
            None,
            Some("Missing Content-Range bytes".into()),
        )
    })?;

    ActionsService::upload_chunk(&state, transaction_id, bytes_range, body).await
}
