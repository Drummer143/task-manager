use axum::{
    extract::{Json, State},
    response::IntoResponse,
};

use crate::entities::auth;

#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = auth::dto::RegisterDto,
    responses(
        (status = 200, description = "User registered successfully", body = crate::entities::user::model::User),
        (status = 400, description = "Invalid credentials", body = crate::shared::error_handlers::handlers::ErrorResponse),
    ),
    security(
        ("jwt" = []),
    ),
    tags = ["Auth"]
)]
pub async fn register(
    State(state): State<crate::types::app_state::AppState>,
    Json(body): Json<auth::dto::RegisterDto>,
) -> impl IntoResponse {
    auth::service::register(&state.db, &body).await
}
