pub fn init_routes() -> axum::Router<crate::types::app_state::AppState> {
    use crate::controllers::auth_controller;

    axum::Router::new()
        .route(
            "/auth/login",
            axum::routing::post(auth_controller::login::login),
        )
        .route(
            "/auth/register",
            axum::routing::post(auth_controller::register::register),
        )
        .route(
            "/auth/logout",
            axum::routing::get(auth_controller::logout::logout),
        )
}
