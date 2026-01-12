use axum::{
    Json,
    body::Bytes,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::actions::{dto::UploadCompleteResponse, service::ActionsService},
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
    ActionsService::upload_whole_file(&state, transaction_id, body)
        .await
        .map(Json)
}
