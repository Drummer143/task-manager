use sqlx::{PgPool, postgres::PgPoolOptions};

pub async fn init_databases(postgres_url: &str, max_connections: u32) -> PgPool {
    PgPoolOptions::new()
        .max_connections(max_connections)
        .connect(postgres_url)
        .await
        .expect("Failed to connect to Postgres")
}
