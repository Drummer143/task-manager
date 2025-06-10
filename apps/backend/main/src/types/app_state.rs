#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::postgres::PgPool,
    pub jwt_secret: Vec<u8>,
}
