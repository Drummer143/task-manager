use std::sync::Arc;

use axum::extract::FromRef;
pub use utils::auth_middleware::InternalAuthState;

#[derive(Clone)]
pub struct AppState {
    pub postgres: sqlx::postgres::PgPool,
    pub redis: Arc<deadpool_redis::Pool>,
    pub auth: InternalAuthState,
    pub livekit_url: Arc<String>,
    pub livekit_api_key: Arc<String>,
    pub livekit_api_secret: Arc<String>,
    pub access_token_default_ttl_seconds: u64,
}

impl FromRef<AppState> for InternalAuthState {
    fn from_ref(state: &AppState) -> Self {
        state.auth.clone()
    }
}
