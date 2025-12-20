use crate::types::app_state::{AppState, JwkSet};
use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode, header},
    middleware::Next,
    response::Response,
};
use error_handlers::{codes, handlers::ErrorResponse};
use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode, decode_header};
use uuid::Uuid;

#[derive(serde::Deserialize)]
struct Claims {
    sub: Uuid,
}

pub async fn fetch_jwks(url: &str) -> Result<JwkSet, String> {
    reqwest::get(url)
        .await
        .map_err(|e| e.to_string())?
        .json::<JwkSet>()
        .await
        .map_err(|e| e.to_string())
}

#[cfg(feature = "test_auth_guard")]
pub async fn auth_guard(
    State(_state): State<AppState>,
    mut _req: Request<Body>,
    next: Next,
) -> Response<Body> {
    next.run(Request::new(Body::empty())).await
}

#[cfg(not(feature = "test_auth_guard"))]
pub async fn auth_guard(
    State(state): State<AppState>,
    mut req: Request<Body>,
    next: Next,
) -> Response<Body> {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(header) if header.starts_with("Bearer ") => &header[7..],
        _ => return make_error_response("Missing or invalid Authorization header"),
    };

    let header = match decode_header(token) {
        Ok(h) => h,
        Err(_) => return make_error_response("Invalid token structure"),
    };
    let kid = header.kid.unwrap_or_default();

    let jwk = {
        let read_lock = state.jwks.read().await;
        let key = read_lock.keys.iter().find(|k| k.kid == kid).cloned();
        drop(read_lock);

        match key {
            Some(k) => k,
            None => match fetch_jwks(&state.authentik_jwks_url).await {
                Ok(new_jwks) => {
                    let mut write_lock = state.jwks.write().await;
                    *write_lock = new_jwks.clone();
                    match new_jwks.keys.iter().find(|k| k.kid == kid).cloned() {
                        Some(k) => k,
                        None => return make_error_response("Key not found even after refresh"),
                    }
                }
                Err(_) => return make_error_response("Auth service unreachable"),
            },
        }
    };

    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
        .map_err(|_| make_error_response("Key error"))
        .unwrap();

    let mut validation = Validation::new(Algorithm::RS256);
    validation.leeway = 60;
    validation.set_audience(&[&state.authentik_audience]);

    let token_data = match decode::<Claims>(token, &decoding_key, &validation) {
        Ok(data) => data,
        Err(e) => {
            println!("JWT Validation Error: {:?}", e.kind());
            return make_error_response(&format!("Invalid token: {:?}", e));
        }
    };

    req.extensions_mut().insert(token_data.claims.sub);

    next.run(req).await
}

fn make_error_response(msg: &str) -> Response<Body> {
    let body = serde_json::to_string(&ErrorResponse::unauthorized(
        codes::UnauthorizedErrorCode::Unauthorized,
        Some(msg.to_string()),
    ))
    .unwrap();

    Response::builder()
        .status(StatusCode::UNAUTHORIZED)
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(body))
        .unwrap()
}
