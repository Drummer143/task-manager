use axum::extract::{Json, State};

#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = crate::dto::auth::LoginDto,
    responses(
        (status = 200, description = "Login successful", body = crate::models::user::User),
        (status = 400, description = "Invalid credentials", body = crate::shared::error_handlers::handlers::ErrorResponse),
    ),
    security(
        ("jwt" = []),
    ),
    tags = ["Auth"]
)]
pub async fn login(
    State(state): State<crate::types::app_state::AppState>,
    Json(body): Json<crate::dto::auth::LoginDto>,
) -> impl axum::response::IntoResponse {
    let user = crate::services::auth_service::login(&state.db, &body.email, &body.password)
        .await?;

    let token = crate::shared::utils::jwt::create_jwt(&user.id, &state.jwt_secret);

    if token.is_err() {
        return Err(
            crate::shared::error_handlers::handlers::ErrorResponse::internal_server_error(),
        );
    }

    let token = token.unwrap();

    let mut headers = axum::http::header::HeaderMap::new();
    headers.insert(
        axum::http::header::SET_COOKIE,
        axum::http::header::HeaderValue::from_str(&format!(
            "token={}; Path=/; HttpOnly; Secure; SameSite=Lax",
            token
        ))
        .unwrap(),
    );

    Ok((axum::http::StatusCode::OK, headers, axum::Json(user)))
}
