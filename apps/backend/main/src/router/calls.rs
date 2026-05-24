use crate::{
    controllers::calls::controller::create_token::create_call_token, types::app_state::AppState,
};

pub fn init(app_state: AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .route("/calls/token", axum::routing::post(create_call_token))
        .layer(axum::middleware::from_fn_with_state(
            app_state,
            utils::auth_middleware::auth_guard,
        ))
}
