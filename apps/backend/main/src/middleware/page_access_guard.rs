use axum::extract::State;
use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::types::app_state::AppState;

// works only with path `workspace/{workspace_id}/page/{page_id}/...`
pub async fn page_access_guard(
    State(state): State<AppState>,
    mut req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let path = req.uri().path();

    let page_id = path.split('/').nth(4).unwrap_or_default();

    let page_id = Uuid::parse_str(page_id);

    if page_id.is_err() {
        return next.run(req).await;
    }

    let user_id = req.extensions().get::<Uuid>();

    if user_id.is_none() {
        let body = serde_json::to_string(&ErrorResponse::unauthorized(
            codes::UnauthorizedErrorCode::Unauthorized,
            Some("User is not authorized".to_string()),
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::UNAUTHORIZED)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let user_id = user_id.unwrap().clone();
    let page_id = page_id.unwrap();

    let page_access = rust_api::entities::page_access::PageAccessRepository::get_one(
        &state.postgres,
        user_id,
        page_id,
    )
    .await;

    if page_access.is_err() {
        let body = serde_json::to_string(&ErrorResponse::forbidden(
            codes::ForbiddenErrorCode::InsufficientPermissions,
            None,
            None,
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::FORBIDDEN)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    req.extensions_mut().insert(page_access.unwrap());

    return next.run(req).await;
}
