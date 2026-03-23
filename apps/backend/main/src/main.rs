use mimalloc::MiMalloc;
use utils::shutdown_signal::shutdown_signal;

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();

    let (router, config) = app::build().await;

    let addr = format!("0.0.0.0:{}", config.port);

    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, router)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Failed to start server");
}
