use std::sync::Arc;

use axum::http;
// use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;

use crate::types::app_state::JwkSet;
mod db_connections;
mod entities;
mod middleware;
mod shared;
mod swagger;
mod types;

#[tokio::main]
async fn main() {
    // tracing_subscriber::registry()
    //     .with(tracing_subscriber::fmt::layer())
    //     .init();

    let _ = dotenvy::dotenv();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL not found");
    let mongo_url = std::env::var("MONGODB_URL").expect("MONGODB_URL not found");
    let rabbitmq_url = std::env::var("RABBITMQ_URL").expect("RABBITMQ_URL not found");
    let jwks_url = std::env::var("AUTHENTIK_JWKS_URL").expect("AUTHENTIK_JWKS_URL must be set");
    let authentik_audience = std::env::var("AUTHENTIK_AUDIENCE").expect("AUTHENTIK_AUDIENCE must be set");

    let jwks: JwkSet = reqwest::get(&jwks_url)
        .await
        .expect("Failed to fetch JWKS")
        .json()
        .await
        .expect("Failed to parse JWKS");

    let (postgres, mongo, rabbitmq) =
        db_connections::init_databases(&db_url, &mongo_url, &rabbitmq_url).await;

    migrator::migrator::migrate(migrator::MigrationDirection::Up)
        .await
        .expect("Failed to run migrations");

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
        ])
        .allow_credentials(true);

    let app_state = types::app_state::AppState {
        postgres,
        mongo,
        rabbitmq: Arc::new(rabbitmq),
        jwks: Arc::new(tokio::sync::RwLock::new(jwks)),
        authentik_jwks_url: jwks_url,
        authentik_audience,
    };

    let app = axum::Router::new()
        .merge(entities::user::router::init(app_state.clone()))
        .merge(entities::profile::router::init(app_state.clone()))
        // .merge(entities::auth::router::init())
        .merge(entities::workspace::router::init(app_state.clone()))
        .merge(entities::workspace_access::router::init(app_state.clone()))
        .merge(entities::page::router::init(app_state.clone()))
        .merge(entities::page_access::router::init(app_state.clone()))
        .merge(entities::task::router::init(app_state.clone()))
        .merge(entities::board_statuses::router::init(app_state.clone()))
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api")
                .url("/api/openapi.json", swagger::ApiDoc::openapi())
                .config(utoipa_swagger_ui::Config::default().doc_expansion("none")),
        )
        .with_state(app_state)
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let port = std::env::var("PORT").unwrap_or("3000".to_string());
    let addr = format!("0.0.0.0:{}", port);

    println!("Listening on {}", addr);
    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
