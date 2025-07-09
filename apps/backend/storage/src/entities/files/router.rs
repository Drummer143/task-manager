use axum::{routing::get, Router};

use crate::{entities::files::controller, types::app_state::AppState};

pub fn init() -> Router<AppState> {
    Router::new()
        .route("/files/{file_id}/{filename}", get(controller::get_file::get_file))
}
