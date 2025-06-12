#[derive(Clone)]
pub struct AppState {
    pub postgres: sqlx::postgres::PgPool,
    pub mongo: mongodb::Client,
    pub rabbitmq: std::sync::Arc<lapin::Channel>,
    pub jwt_secret: Vec<u8>,
}
