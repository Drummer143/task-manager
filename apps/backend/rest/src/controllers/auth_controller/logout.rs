#[utoipa::path(
    get,
    path = "/auth/logout",
    responses(
        (status = 201, description = "Logout successful"),
    ),
    security(
        ("jwt" = []),
    ),
    tags = ["Auth"]
)]
pub async fn logout() -> impl axum::response::IntoResponse {
    let mut headers = axum::http::header::HeaderMap::new();
    headers.insert(
        axum::http::header::SET_COOKIE,
        axum::http::header::HeaderValue::from_str(
            "token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
        )
        .unwrap(),
    );

    (axum::http::StatusCode::NO_CONTENT, headers)
}
