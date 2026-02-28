use axum::{
    Router,
    extract::DefaultBodyLimit,
    middleware,
    routing::{get, put, delete},
};
use utils::auth_middleware::auth_guard;

use crate::{
    entities::profile::controller::{
        delete_avatar::delete_avatar, get_profile::get_profile, update_profile::update_profile, upload_avatar::upload_avatar
    },
    types::app_state::AppState,
};

pub fn init(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/profile", get(get_profile))
        .route("/profile", put(update_profile))
        .route(
            "/profile/avatar",
            put(upload_avatar).layer(DefaultBodyLimit::max(10 * 1024 * 1024)),
        )
        .route("/profile/avatar", delete(delete_avatar))
        .layer(middleware::from_fn_with_state(state, auth_guard))
}
