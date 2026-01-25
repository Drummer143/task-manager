use std::sync::Arc;

use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub postgres: PgPool,
    pub redis: Arc<deadpool_redis::Pool>,
    pub assets_folder_path: Arc<String>,
    pub temp_folder_path: Arc<String>,
    pub jwt_secret: Arc<String>,
    pub main_service_url: Arc<String>,
    // pub rabbitmq: std::sync::Arc<lapin::Channel>,
    // pub jwt_secret: Vec<u8>,
}
