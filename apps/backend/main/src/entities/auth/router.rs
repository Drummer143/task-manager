pub fn init() -> axum::Router<crate::types::app_state::AppState> {
    use crate::entities::auth::controller;

    axum::Router::new()
        .route(
            "/auth/login",
            axum::routing::post(controller::login::login),
        )
        .route(
            "/auth/register",
            axum::routing::post(controller::register::register),
        )
        .route(
            "/auth/logout",
            axum::routing::get(controller::logout::logout),
        )
}
