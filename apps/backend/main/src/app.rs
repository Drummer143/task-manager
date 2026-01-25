use axum::http;
use std::sync::Arc;
use utoipa::OpenApi;

use crate::types::app_state::{AppState, JwkSet};

mod db_connections;
mod entities;
mod middleware;
mod shared;
mod swagger;
mod types;
mod webhooks;

pub async fn build() -> axum::Router {
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL not found");

    use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

    tracing_subscriber::registry()
        .with(EnvFilter::new("debug,lapin=warn,sqlx=warn"))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let jwks_url = std::env::var("AUTHENTIK_JWKS_URL").expect("AUTHENTIK_JWKS_URL must be set");
    let authentik_audience =
        std::env::var("AUTHENTIK_AUDIENCE").expect("AUTHENTIK_AUDIENCE must be set");

    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    let jwks: JwkSet = reqwest::get(&jwks_url)
        .await
        .expect("Failed to fetch JWKS")
        .json()
        .await
        .expect("Failed to parse JWKS");

    let postgres = db_connections::init_databases(&db_url).await;

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

    let app_state = AppState {
        postgres,
        jwks: Arc::new(tokio::sync::RwLock::new(jwks)),
        authentik_jwks_url: Arc::new(jwks_url),
        authentik_audience: Arc::new(authentik_audience),
        jwt_secret: Arc::new(jwt_secret),
    };

    let app = axum::Router::new()
        .merge(entities::user::router::init(app_state.clone()))
        .merge(entities::profile::router::init(app_state.clone()))
        .merge(entities::workspace::router::init(app_state.clone()))
        .merge(entities::page::router::init(app_state.clone()))
        .merge(entities::task::router::init(app_state.clone()))
        .merge(entities::board_statuses::router::init(app_state.clone()))
        .merge(entities::assets::router::init(app_state.clone()))
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api")
                .url("/api/api.json", swagger::ApiDoc::openapi())
                .url("/api/webhooks.json", swagger::WebhooksDoc::openapi())
                .url("/api/internal.json", swagger::InternalApiDoc::openapi())
                .config(
                    utoipa_swagger_ui::Config::default()
                        .doc_expansion("none")
                        .display_request_duration(true),
                ),
        )
        .merge(webhooks::authentik::router::init())
        .with_state(app_state)
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(cors);

    app
}
