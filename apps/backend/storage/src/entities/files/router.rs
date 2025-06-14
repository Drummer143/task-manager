use axum::{routing::get, Router};

use crate::entities::files::controller;

pub fn init() -> Router {
    Router::new().route("/files/{*path}", get(controller::get_file::get_file))
}
