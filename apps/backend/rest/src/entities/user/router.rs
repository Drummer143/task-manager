pub fn init(
    state: crate::types::app_state::AppState,
) -> axum::Router<crate::types::app_state::AppState> {
    axum::Router::new()
        .route(
            "/users/{id}",
            axum::routing::get(super::controller::get_by_id::get_by_id),
        )
        .route(
            "/users",
            axum::routing::get(super::controller::get_list::get_list),
        )
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middleware::with_auth::with_auth,
        ))
}
