use axum::http::StatusCode;
use error_handlers::handlers::ErrorResponse;

pub mod page_access_guard;
pub mod workspace_access_guard;

pub fn json_error_response(
    status: StatusCode,
    error: ErrorResponse,
) -> axum::response::Response<axum::body::Body> {
    let body = serde_json::to_string(&error).unwrap_or_default();
    axum::response::Response::builder()
        .status(status)
        .header("content-type", "application/json")
        .body(axum::body::Body::from(body))
        .unwrap()
}
