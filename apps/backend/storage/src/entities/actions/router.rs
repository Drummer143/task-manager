use axum::{extract::DefaultBodyLimit, routing::post, Router};

use crate::types::app_state::AppState;

pub fn init() -> Router<AppState> {
    Router::new()
        .route("/actions/upload", post(super::controller::upload::upload))
        .layer(DefaultBodyLimit::max(10 * 1024 * 1024)) // 10MB limit
}
