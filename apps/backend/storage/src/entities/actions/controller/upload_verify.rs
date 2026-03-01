use axum::{
    Json,
    extract::{Path, State},
};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::actions::{
        dto::{UploadSuccessResponse, UploadVerifyDto},
        service::ActionsService,
    },
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/actions/upload/{transaction_id}/verify",
    params(
        ("transaction_id" = Uuid, Path, description = "Transaction ID"),
    ),
    request_body = UploadVerifyDto,
    responses(
        (status = 200, description = "Verification result", body = UploadSuccessResponse),
    ),
    tags = ["Upload file"],
)]
pub async fn upload_verify(
    State(state): State<AppState>,
    Path(transaction_id): Path<Uuid>,
    Json(body): Json<UploadVerifyDto>,
) -> Result<Json<UploadSuccessResponse>, ErrorResponse> {
    ActionsService::upload_verify(&state, transaction_id, body)
        .await
        .map(Json)
}
