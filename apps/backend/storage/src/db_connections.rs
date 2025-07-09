use sqlx::{postgres::PgPoolOptions, PgPool};

pub async fn init_databases(
    postgres_url: &str,
    // mongo_url: &str,
    // rabbitmq_url: &str,
) -> /* ( */PgPool/* , mongodb::Client, lapin::Channel) */ {
    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(postgres_url)
        .await
        .expect("Failed to connect to Postgres");

    // let mongo_options = mongodb::options::ClientOptions::parse(mongo_url)
    //     .await
    //     .expect("Failed to connect to MongoDB");

    // let mongo = mongodb::Client::with_options(mongo_options).expect("Failed to connect to MongoDB");

    // let rabbitmq = lapin::Connection::connect(rabbitmq_url, lapin::ConnectionProperties::default())
    //     .await
    //     .expect("Failed to connect to RabbitMQ");

    // let channel = rabbitmq
    //     .create_channel()
    //     .await
    //     .expect("Failed to create channel");

    // let mut queue_options = lapin::options::QueueDeclareOptions::default();
    // queue_options.durable = true;

    // channel
    //     .queue_declare(
    //         "refresh_signals",
    //         queue_options,
    //         lapin::types::FieldTable::default(),
    //     )
    //     .await
    //     .expect("Failed to declare queue");

    /* ( */db/* , mongo, channel) */
}
