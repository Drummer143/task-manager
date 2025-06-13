use axum::{routing::post, Router};

pub fn init() -> Router {
    Router::new().route("/files/upload", post(super::controller::upload::upload))
}
