pub fn init() -> axum::Router<crate::types::app_state::AppState> {
    axum::Router::new().route(
        "/workspaces/{id}",
        axum::routing::get(super::controller::get_by_id::get_by_id),
    )
}
