use sqlx::{postgres::PgPoolOptions, PgPool};

pub async fn init_databases(
    postgres_url: &str,
    // rabbitmq_url: &str,
) -> /* ( */PgPool/* , lapin::Channel) */ {
    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(postgres_url)
        .await
        .expect("Failed to connect to Postgres");

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

    /* ( */db/* , channel) */
}
