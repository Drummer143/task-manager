use axum::http;
use tower_http::services::ServeDir;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;

mod entities;
mod swagger;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::AllowOrigin::exact(
            "http://localhost:1346".parse().unwrap(),
        ))
        .allow_methods([
            http::Method::GET,
            http::Method::POST,
            http::Method::OPTIONS,
            http::Method::PUT,
            http::Method::DELETE,
            http::Method::PATCH,
            http::Method::OPTIONS,
        ])
        .allow_headers([
            http::header::CONTENT_TYPE,
            http::header::AUTHORIZATION,
            http::header::ACCEPT,
        ])
        .allow_credentials(true);

    let port = std::env::var("SELF_PORT").unwrap_or("3000".to_string());
    let addr = format!("0.0.0.0:{}", port);

    let app = axum::Router::new()
        .merge(entities::file::router::init())
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api")
                .url("/api/openapi.json", swagger::ApiDoc::openapi()),
        )
        .nest_service(
            "/files",
            ServeDir::new(std::env::var("STATIC_FOLDER_PATH").unwrap_or("./static".to_string())),
        )
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
