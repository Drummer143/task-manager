#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::postgres::PgPool,
}
