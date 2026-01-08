use std::sync::Arc;

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct JwkSet {
    pub keys: Vec<Jwk>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Jwk {
    pub kid: String,
    pub kty: String,
    pub alg: String,
    pub n: String,
    pub e: String,
}

#[derive(Clone)]
pub struct AppState {
    pub postgres: sqlx::postgres::PgPool,
    // pub rabbitmq: std::sync::Arc<lapin::Channel>,
    pub jwks: Arc<tokio::sync::RwLock<JwkSet>>,
    pub authentik_jwks_url: Arc<String>,
    pub authentik_audience: Arc<String>,
}
