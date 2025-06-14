use axum::{routing::post, Router};

pub fn init() -> Router {
    Router::new().route("/actions/upload", post(super::controller::upload::upload))
}
