use axum::Router;

use crate::types::app_state::AppState;

pub mod assets;
pub mod board_statuses;
pub mod pages;
pub mod profile;
pub mod tasks;
pub mod users;
pub mod workspaces;

pub fn init_router(state: AppState) -> Router<AppState> {
    Router::new()
        .merge(assets::init(state.clone()))
        .merge(pages::init(state.clone()))
        .merge(tasks::init(state.clone()))
        .merge(board_statuses::init(state.clone()))
        .merge(profile::init(state.clone()))
        .merge(users::init(state.clone()))
        .merge(workspaces::init(state.clone()))
        .merge(crate::controllers::internal::init())
}
