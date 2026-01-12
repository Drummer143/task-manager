use crate::{
    entities::actions::{dto::UploadStatusResponse, service::ActionsService},
    types::app_state::AppState,
};
use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

#[utoipa::path(
    get,
    path = "/actions/upload/{transaction_id}/status",
    params(
        ("transaction_id", Path, description = "Transaction ID"),
    ),
    responses(
        (status = 200, description = "Upload status", body = UploadStatusResponse),
    ),
    tags = ["Upload file"],
)]
pub async fn upload_status(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Json<UploadStatusResponse>, ErrorResponse> {
    ActionsService::upload_status(&state, transaction_id)
        .await
        .map(Json)
}
