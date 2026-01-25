use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::actions::{dto::AssetResponse, service::ActionsService},
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/actions/upload/{transaction_id}/complete",
    params(
        ("transaction_id", Path, description = "Transaction ID"),
    ),
    responses(
        (status = 200, description = "Upload completion result", body = AssetResponse),
    ),
    tags = ["Upload file"],
)]
pub async fn upload_complete(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Json<AssetResponse>, ErrorResponse> {
    ActionsService::upload_complete(&state, transaction_id)
        .await
        .map(Json)
}
