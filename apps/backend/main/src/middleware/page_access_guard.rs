use axum::extract::State;
use error_handlers::{codes, handlers::ErrorResponse};
use uuid::Uuid;

use crate::types::app_state::AppState;

// works only with path `/task/{task_id}/...`
pub async fn page_access_guard_task_route(
    State(state): State<AppState>,
    mut req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let task_id = req.uri().path().split('/').nth(2).unwrap_or_default();

    let task_id = Uuid::parse_str(task_id);

    if task_id.is_err() {
        let body = serde_json::to_string(&ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidParams,
            None,
            Some("Invalid task id".to_string()),
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::BAD_REQUEST)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let task_id = task_id.unwrap();

    let page = sql::page::PageRepository::get_page_by_task_id(&state.postgres, task_id).await;

    if let Err(error) = page {
        let body = serde_json::to_string(&ErrorResponse::not_found(
            error_handlers::codes::NotFoundErrorCode::NotFound,
            None,
            Some(error.to_string()),
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::BAD_REQUEST)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let page = page.unwrap();

    let page_id = page.id.clone();

    req.extensions_mut().insert(page);

    return validate_page_access(state, req, page_id, next).await;
}

// works only with path `/page/{page_id}/...`
pub async fn page_access_guard_by_page_route(
    State(state): State<AppState>,
    req: axum::http::Request<axum::body::Body>,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
    let path = req.uri().path();

    let page_id = path.split('/').nth(2).unwrap_or_default();

    let page_id = Uuid::parse_str(page_id);

    if page_id.is_err() {
        let body = serde_json::to_string(&ErrorResponse::bad_request(
            error_handlers::codes::BadRequestErrorCode::InvalidParams,
            None,
            Some("Invalid page id".to_string()),
        ))
        .unwrap();

        return axum::response::Response::builder()
            .status(axum::http::StatusCode::BAD_REQUEST)
            .body(axum::body::Body::from(body))
            .unwrap();
    }

    let page_id = page_id.unwrap();

    return validate_page_access(state, req, page_id, next).await;
}

pub async fn validate_page_access(
    state: AppState,
    mut req: axum::http::Request<axum::body::Body>,
    page_id: Uuid,
    next: axum::middleware::Next,
) -> axum::response::Response<axum::body::Body> {
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

    let page_access =
        sql::page::PageRepository::get_one_page_access(&state.postgres, user_id, page_id).await;

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
