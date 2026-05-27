use crate::{
    controllers::rooms::controller::create_room::create_room, types::app_state::AppState,
};

pub fn init(app_state: AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .route("/calls/room", axum::routing::post(create_room))
        .layer(axum::middleware::from_fn_with_state(
            app_state,
            utils::auth_middleware::auth_guard,
        ))
}
