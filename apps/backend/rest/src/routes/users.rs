pub fn init_routes() -> axum::Router<crate::types::app_state::AppState> {
    axum::Router::new()
        .route(
            "/users/{id}",
            axum::routing::get(crate::controllers::user_controller::get_by_id::get_by_id),
        )
        .route(
            "/users",
            axum::routing::get(crate::controllers::user_controller::get_list::get_list),
        )
}
