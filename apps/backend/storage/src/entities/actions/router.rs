use axum::{Router, extract::DefaultBodyLimit, routing::post};

use crate::types::app_state::AppState;

pub fn init() -> Router<AppState> {
    Router::new()
        .route("/actions/upload", post(super::controller::upload::upload))
        .route(
            "/actions/upload/init",
            post(super::controller::upload_init::upload_init),
        )
        .route(
            "/actions/upload/{transaction_id}",
            post(super::controller::upload_chunked::upload_chunked),
        )
        .route(
            "/actions/upload/{transaction_id}/verify",
            post(super::controller::upload_verify::upload_verify)
                .layer(DefaultBodyLimit::max(50 * 1024 * 1024)),
        )
        .route(
            "/actions/upload/{transaction_id}/complete",
            post(super::controller::upload_complete::upload_complete),
        )
        .layer(DefaultBodyLimit::max(10 * 1024 * 1024)) // 10MB limit
}
