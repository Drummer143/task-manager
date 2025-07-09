use axum::http;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;

mod db_connections;
mod entities;
mod swagger;
mod types;

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::AllowOrigin::list([
            "http://0.0.0.0:1346".parse().unwrap(),
            "http://0.0.0.0:80".parse().unwrap(),
        ]))
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
            http::header::RANGE,
            http::header::CONTENT_RANGE,
        ])
        .expose_headers([
            http::header::CONTENT_RANGE,
            http::header::CONTENT_LENGTH,
            http::header::ACCEPT_RANGES,
        ])
        .allow_credentials(true);

    let port = std::env::var("SELF_PORT").unwrap_or("3000".to_string());
    let addr = format!("0.0.0.0:{}", port);

    let db = db_connections::init_databases(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL not found"),
    )
    .await;

    let static_folder_path = std::path::PathBuf::from(
        std::env::var("STATIC_FOLDER_PATH").expect("STATIC_FOLDER_PATH not found"),
    );

    if !static_folder_path.exists() {
        std::fs::create_dir_all(&static_folder_path).expect("Failed to create static folder");
    }

    let app_state = types::app_state::AppState { postgres: db };

    let app = axum::Router::new()
        .merge(entities::actions::router::init())
        .merge(entities::files::router::init())
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api")
                .url("/api/openapi.json", swagger::ApiDoc::openapi()),
        )
        .with_state(app_state)
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
