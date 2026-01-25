use std::sync::Arc;

use axum::http;
use mimalloc::MiMalloc;
use utoipa::OpenApi;

mod db_connections;
mod entities;
mod redis;
mod swagger;
mod types;

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();

    // use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

    // tracing_subscriber::registry()
    //     .with(EnvFilter::new("debug,lapin=warn,sqlx=warn"))
    //     .with(tracing_subscriber::fmt::layer())
    //     .init();

    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::AllowOrigin::list([
            "http://0.0.0.0:1346".parse().unwrap(),
            "http://0.0.0.0:80".parse().unwrap(),
            "http://localhost:1346".parse().unwrap(),
            "http://localhost:80".parse().unwrap(),
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

    let (db, redis) = db_connections::init_databases(
        &std::env::var("DATABASE_URL").expect("DATABASE_URL not found"),
        &std::env::var("REDIS_URL").expect("REDIS_URL not found"),
    )
    .await;

    migrator::migrator::migrate(migrator::MigrationDirection::Up)
        .await
        .expect("Failed to run migrations");

    let static_folder_path = std::path::PathBuf::from(
        std::env::var("STATIC_FOLDER_PATH").expect("STATIC_FOLDER_PATH not found"),
    );

    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET not found");

    let main_service_url = std::env::var("MAIN_SERVICE_URL").expect("MAIN_SERVICE_URL not found");

    let assets_folder_path = static_folder_path.join("assets");
    let temp_folder_path = static_folder_path.join("temp");

    if !assets_folder_path.exists() {
        std::fs::create_dir_all(&assets_folder_path).expect("Failed to create assets folder");
    }

    if !temp_folder_path.exists() {
        std::fs::create_dir_all(&temp_folder_path).expect("Failed to create temp folder");
    }

    let app_state = types::app_state::AppState {
        postgres: db,
        redis: Arc::new(redis),
        assets_folder_path: Arc::new(assets_folder_path.to_str().unwrap().to_string()),
        temp_folder_path: Arc::new(temp_folder_path.to_str().unwrap().to_string()),
        jwt_secret: Arc::new(jwt_secret),
        main_service_url: Arc::new(main_service_url),
    };

    let app = axum::Router::new()
        .merge(entities::actions::router::init())
        // .merge(entities::files::router::init())
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api")
                .url("/api/openapi.json", swagger::ApiDoc::openapi()),
        )
        .with_state(app_state)
        // .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(cors);

    tracing::info!("Listening on {}", addr);
    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
