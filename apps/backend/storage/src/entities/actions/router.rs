use axum::{extract::DefaultBodyLimit, routing::post, Router};

pub fn init() -> Router {
    Router::new()
        .route("/actions/upload", post(super::controller::upload::upload))
        .layer(DefaultBodyLimit::max(10 * 1024 * 1024)) // 10MB limit
}
