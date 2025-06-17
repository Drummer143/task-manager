use axum::{routing::{get, head}, Router};

use crate::entities::files::controller;

pub fn init() -> Router {
    Router::new()
        .route("/files/{*path}", get(controller::get_file::get_file))
        .route("/files/{*path}", head(controller::get_file_head::head_file))
}
