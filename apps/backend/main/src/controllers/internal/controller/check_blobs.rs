use axum::{Json, extract::State};
use error_handlers::handlers::ErrorResponse;

use crate::{
    controllers::internal::dto::{CheckBlobsDto, CheckBlobsResponse},
    repos::assets::AssetsRepository,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/internal/assets/check-blobs",
    operation_id = "check_blobs",
    request_body = CheckBlobsDto,
    responses(
        (status = 200, description = "Returns existing blob ids", body = CheckBlobsResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Internal"],
)]
pub async fn check_blobs(
    State(state): State<AppState>,
    Json(body): Json<CheckBlobsDto>,
) -> Result<Json<CheckBlobsResponse>, ErrorResponse> {
    let existing_blob_ids = AssetsRepository::get_existing_blobs(&state.postgres, &body.blob_ids)
        .await
        .map_err(ErrorResponse::from)?;

    Ok(Json(CheckBlobsResponse { existing_blob_ids }))
}
