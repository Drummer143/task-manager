pub fn init() -> axum::Router<crate::types::app_state::AppState> {
    use crate::webhooks::authentik::user_created::controller;

    axum::Router::new()
    .route("/webhooks/authentik/user_created", axum::routing::post(controller::user_created))
}
