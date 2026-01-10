use std::sync::Arc;

use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub postgres: PgPool,
    pub redis: Arc<deadpool_redis::Pool>,
    pub assets_folder_path: String,
    pub temp_folder_path: String,
    // pub rabbitmq: std::sync::Arc<lapin::Channel>,
    // pub jwt_secret: Vec<u8>,
}
