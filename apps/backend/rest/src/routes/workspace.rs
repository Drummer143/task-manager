pub fn init_routes() -> axum::Router<crate::types::app_state::AppState> {
    axum::Router::new().route(
        "/workspaces/{id}",
        axum::routing::get(crate::controllers::workspace_controller::get_by_id::get_by_id),
    )
}
