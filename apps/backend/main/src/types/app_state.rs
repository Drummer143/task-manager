use std::sync::Arc;

use axum::extract::FromRef;
pub use utils::auth_middleware::InternalAuthState;

#[derive(Clone)]
pub struct AppState {
    pub postgres: sqlx::postgres::PgPool,
    // pub rabbitmq: std::sync::Arc<lapin::Channel>,
    pub auth: InternalAuthState,
    pub jwt_secret: Arc<String>,
    pub authentik_api_url: Arc<String>,
    pub authentik_api_token: Arc<String>,
}

impl FromRef<AppState> for InternalAuthState {
    fn from_ref(state: &AppState) -> Self {
        state.auth.clone()
    }
}
