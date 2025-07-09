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
        (status = 200, description = "User registered successfully", body = rust_api::entities::user::model::User),
        (status = 400, description = "Invalid credentials", body = error_handlers::handlers::ErrorResponse),
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
    match auth::service::register(&state.postgres, &body).await {
        Ok(user) => (axum::http::StatusCode::OK, axum::Json(user)).into_response(),
        Err(error) => error.into_response(),
    }
}
