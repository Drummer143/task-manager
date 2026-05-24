use axum::{Extension, Json, extract::State};
use error_handlers::handlers::ErrorResponse;
use uuid::Uuid;

use crate::{
    controllers::calls::dto::{CreateCallTokenRequest, CreateCallTokenResponse},
    services::calls::CallService,
    types::app_state::AppState,
};

#[utoipa::path(
    post,
    path = "/calls/token",
    operation_id = "create_call_token",
    responses(
        (status = 200, description = "Call token created", body = CreateCallTokenResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    tag = "Calls"
)]
pub async fn create_call_token(
    State(app_state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
    Json(body): Json<CreateCallTokenRequest>,
) -> Result<Json<CreateCallTokenResponse>, ErrorResponse> {
    let token = CallService::create_token(
        &app_state,
        user_id,
        body.room_id,
    )
    .await?;
    Ok(Json(CreateCallTokenResponse { token }))
}
