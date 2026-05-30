use axum::Router;

use crate::types::app_state::AppState;

pub mod rooms;

pub fn init_router(state: AppState) -> Router<AppState> {
    Router::new().merge(rooms::init(state.clone()))
}
