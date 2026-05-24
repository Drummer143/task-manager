use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    controllers::calls::dto::CallTokenResponse, services::calls::CallService,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/calls/token",
    operation_id = "create_call_token",
    responses(
        (status = 200, description = "Call token created", body = CallTokenResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Calls"
)]
pub async fn create_token(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
) -> Result<Json<CallTokenResponse>, ErrorResponse> {
    let token = CallService::create_token(
        user_id,
        &app_state.livekit_api_key,
        &app_state.livekit_api_secret,
    )
    .await?;
    Ok(Json(CallTokenResponse { token }))
}
