use sqlx::{postgres::PgPoolOptions, PgPool};

pub async fn init_databases(postgres_url: &str, mongo_url: &str) -> (PgPool, mongodb::Client) {
    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(postgres_url)
        .await
        .expect("Failed to connect to Postgres");

    let mongo_options = mongodb::options::ClientOptions::parse(mongo_url)
        .await
        .expect("Failed to connect to MongoDB");

    let mongo = mongodb::Client::with_options(mongo_options).expect("Failed to connect to MongoDB");

    (db, mongo)
}
