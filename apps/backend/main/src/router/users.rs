use crate::{
    controllers::user::controller::{get_by_id::get_by_id, get_list::get_list},
    types::app_state::AppState,
};

pub fn init(state: AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .route("/users/{id}", axum::routing::get(get_by_id))
        .route("/users", axum::routing::get(get_list))
        .layer(axum::middleware::from_fn_with_state(
            state,
            utils::auth_middleware::auth_guard,
        ))
}
