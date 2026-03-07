use axum::{Extension, Json, extract::State};
pub use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    entities::assets::dto::CreateUploadTokenResponse,
    services::assets::{AssetsService, dto::CreateUploadTokenDto},
};

#[utoipa::path(
    post,
    path = "/assets/token",
    operation_id = "create_upload_token",
    request_body = CreateUploadTokenDto,
    responses(
        (status = 200, description = "Upload token created successfully", body = CreateUploadTokenResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse),
    ),
    tags = ["Assets"],
)]
pub async fn create_upload_token(
    State(state): State<crate::types::app_state::AppState>,
    Extension(user_id): Extension<Uuid>,
    Json(body): Json<CreateUploadTokenDto>,
) -> Result<Json<CreateUploadTokenResponse>, ErrorResponse> {
    AssetsService::create_upload_token(&state.postgres, &state.jwt_secret, body, user_id)
        .await
        .map(|token| Json(CreateUploadTokenResponse { token }))
}
