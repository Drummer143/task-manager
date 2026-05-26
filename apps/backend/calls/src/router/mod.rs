use axum::Router;

use crate::types::app_state::AppState;

pub mod calls;

pub fn init_router(state: AppState) -> Router<AppState> {
    Router::new().merge(calls::init(state.clone()))
}
