pub fn init() -> axum::Router<crate::types::app_state::AppState> {
    use crate::webhooks::authentik::user_sync::controller;

    axum::Router::new()
    .route("/webhooks/authentik/user_sync", axum::routing::post(controller::user_sync))
}
