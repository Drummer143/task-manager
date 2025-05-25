use axum::{
    extract::{Json, State},
    response::IntoResponse,
};

#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = crate::dto::auth::RegisterDto,
    responses(
        (status = 200, description = "User registered successfully", body = crate::models::user::User),
        (status = 400, description = "Invalid credentials", body = crate::shared::error_handlers::handlers::ErrorResponse),
    ),
    security(
        ("jwt" = []),
    ),
    tags = ["Auth"]
)]
pub async fn register(
    State(state): State<crate::types::app_state::AppState>,
    Json(body): Json<crate::dto::auth::RegisterDto>,
) -> impl IntoResponse {
    crate::services::auth_service::register(&state.db, &body)
        .await
}
