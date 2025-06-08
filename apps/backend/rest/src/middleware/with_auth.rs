use axum::extract::State;
use axum_extra::extract::CookieJar;

use crate::{
    shared::error_handlers::{codes, handlers::ErrorResponse},
    types::app_state::AppState,
};

pub async fn with_auth(
    State(state): State<AppState>,
    mut req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let cookie_jar = CookieJar::from_headers(req.headers());

    let token = cookie_jar.get("token");

    if token.is_none() {
        let body = serde_json::to_string(&ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::Unauthorized,
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::UNAUTHORIZED)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let token = token.unwrap().value();

    let user_id = crate::shared::utils::jwt::get_user_id_from_cookie(token, &state.jwt_secret);

    if user_id.is_err() {
        let body = serde_json::to_string(&ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::Unauthorized,
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::UNAUTHORIZED)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let user_id = user_id.unwrap();

    let user = crate::entities::user::service::find_by_id(&state.db, user_id).await;

    if user.is_err() {
        let body = serde_json::to_string(&ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::Unauthorized,
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::UNAUTHORIZED)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let user = user.unwrap();

    req.extensions_mut().insert(user);

    next.run(req).await
}
