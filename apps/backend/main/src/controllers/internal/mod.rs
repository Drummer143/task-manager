pub mod controller;
pub mod dto;

use axum::{routing::post, Router};

use crate::types::app_state::AppState;

pub fn init() -> Router<AppState> {
    Router::new().route("/internal/assets/check-blobs", post(controller::check_blobs::check_blobs))
}
