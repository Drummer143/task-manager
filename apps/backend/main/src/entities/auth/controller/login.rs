use axum::extract::{Json, State};

#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = crate::entities::auth::dto::LoginDto,
    responses(
        (status = 200, description = "Login successful", body = repo::entities::user::model::User),
        (status = 400, description = "Invalid credentials", body = error_handlers::handlers::ErrorResponse),
    ),
    security(
        ("jwt" = []),
    ),
    tags = ["Auth"]
)]
pub async fn login(
    State(state): State<crate::types::app_state::AppState>,
    cookie_jar: axum_extra::extract::cookie::CookieJar,
    Json(body): Json<crate::entities::auth::dto::LoginDto>,
) -> impl axum::response::IntoResponse {
    let user =
        crate::entities::auth::service::login(&state.postgres, &body.email, &body.password).await?;

    let token = crate::shared::utils::jwt::create_jwt(&user.id, &state.jwt_secret);

    if token.is_err() {
        return Err(
            error_handlers::handlers::ErrorResponse::internal_server_error(),
        );
    }

    let mut token_cookie = axum_extra::extract::cookie::Cookie::new("token", token.unwrap());
    token_cookie.set_http_only(true);
    token_cookie.set_path("/");
    token_cookie.set_secure(true);
    token_cookie.set_same_site(axum_extra::extract::cookie::SameSite::Lax);

    let cookie_jar = cookie_jar.add(token_cookie);

    Ok((axum::http::StatusCode::OK, cookie_jar, axum::Json(user)))
}
