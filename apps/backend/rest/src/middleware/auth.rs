use axum::{body::Body, http::Request, middleware::Next, response::Response};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

use crate::shared::error_handlers::{codes, handlers::ErrorResponse};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct IntrospectionResponse {
    pub active: bool,
    pub sub: Option<String>,
    pub username: Option<String>,
    pub scope: Option<String>,
    // добавь другие поля при необходимости
}

pub async fn auth_middleware(
    mut req: Request<Body>,
    next: Next,
) -> Result<Response<Body>, ErrorResponse> {
    let token = extract_bearer_token(req.headers()).ok_or(ErrorResponse::unauthorized(
        codes::UnauthorizedErrorCode::Unauthorized,
    ))?;

    let client_id = env::var("ZITADEL_CLIENT_ID").expect("Missing CLIENT_ID");
    let client_secret = env::var("ZITADEL_CLIENT_SECRET").expect("Missing CLIENT_SECRET");
    let introspect_url = env::var("ZITADEL_INTROSPECTION_URL").expect("Missing INTROSPECTION_URL");

    let client = Client::new();
    let res = client
        .post(&introspect_url)
        .basic_auth(client_id, Some(client_secret))
        .form(&[("token", token)])
        .send()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    if !res.status().is_success() {
        return Err(ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::Unauthorized,
        ));
    }

    let data: IntrospectionResponse = res
        .json()
        .await
        .map_err(|_| ErrorResponse::internal_server_error())?;

    tracing::warn!("Introspection response: {:#?}", data);

    if !data.active {
        return Err(ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::Unauthorized,
        ));
    }

    req.extensions_mut().insert(data);

    Ok(next.run(req).await)
}

fn extract_bearer_token(headers: &axum::http::HeaderMap) -> Option<String> {
    let auth_header = headers.get(axum::http::header::AUTHORIZATION)?;
    let auth_str = auth_header.to_str().ok()?;

    if auth_str.to_lowercase().starts_with("bearer ") {
        Some(auth_str[7..].trim().to_string())
    } else {
        None
    }
}
