use std::sync::Arc;

use axum::extract::FromRef;
pub use utils::auth_middleware::InternalAuthState;

#[derive(Clone)]
pub struct AppState {
    pub postgres: sqlx::postgres::PgPool,
    pub auth: InternalAuthState,
    pub livekit_url: Arc<String>,
    pub livekit_api_key: Arc<String>,
    pub livekit_api_secret: Arc<String>,
}

impl FromRef<AppState> for InternalAuthState {
    fn from_ref(state: &AppState) -> Self {
        state.auth.clone()
    }
}
