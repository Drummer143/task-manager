use sqlx::{PgPool, postgres::PgPoolOptions};

pub async fn init_databases(
    postgres_url: &str,
    redis_url: &str,
    max_connections: u32,
) -> (PgPool, deadpool_redis::Pool) {
    let db = PgPoolOptions::new()
        .max_connections(max_connections)
        .connect(postgres_url)
        .await
        .expect("Failed to connect to Postgres");

    let redis = deadpool_redis::Config::from_url(redis_url)
        .create_pool(Some(deadpool_redis::Runtime::Tokio1))
        .expect("Failed to connect to Redis");

    (db, redis)
}
