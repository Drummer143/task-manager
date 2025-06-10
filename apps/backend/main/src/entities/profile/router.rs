pub fn init(state: crate::types::app_state::AppState) -> axum::Router<crate::types::app_state::AppState> {
    axum::Router::new()
        .route(
            "/profile",
            axum::routing::get(super::controller::get_profile::get_profile),
        )
        .layer(axum::middleware::from_fn_with_state(state, crate::middleware::auth_guard::auth_guard))
}
