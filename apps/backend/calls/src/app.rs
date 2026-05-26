use axum::http;
use std::sync::Arc;
use utils::{auth_middleware::InternalAuthState, types::jwks::JwkSet};
use utoipa::OpenApi;

use crate::{config::Config, types::app_state::AppState};

mod config;
mod controllers;
mod db_connections;
mod router;
mod services;
mod swagger;
mod types;

pub fn openapi_json() -> String {
    serde_json::to_string_pretty(&swagger::ApiDoc::openapi()).unwrap()
}

pub async fn build() -> (axum::Router, Config) {
    let config = Config::from_env().expect("Invalid configuration");

    use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

    tracing_subscriber::registry()
        .with(EnvFilter::new(&config.log_filter))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let jwks = reqwest::get(&config.authentik_jwks_url)
        .await
        .expect("Failed to fetch JWKS")
        .json::<JwkSet>()
        .await
        .expect("Failed to parse JWKS");

    let postgres =
        db_connections::init_databases(&config.database_url, config.db_max_connections).await;

    migrator::migrator::migrate(migrator::MigrationDirection::Up)
        .await
        .expect("Failed to run migrations");

    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::AllowOrigin::list(
            config.cors_origins.clone(),
        ))
        .allow_methods([
            http::Method::GET,
            http::Method::POST,
            http::Method::OPTIONS,
            http::Method::PUT,
            http::Method::DELETE,
            http::Method::PATCH,
        ])
        .allow_headers([
            http::header::CONTENT_TYPE,
            http::header::AUTHORIZATION,
            http::header::ACCEPT,
        ])
        .allow_credentials(true);

    let auth = InternalAuthState {
        jwks: Arc::new(tokio::sync::RwLock::new(jwks)),
        authentik_jwks_url: Arc::new(config.authentik_jwks_url.clone()),
        authentik_audience: Arc::new(config.authentik_audience.clone()),
    };

    let app_state = AppState {
        postgres,
        auth,
        livekit_url: Arc::new(config.livekit_url.clone()),
        livekit_api_key: Arc::new(config.livekit_api_key.clone()),
        livekit_api_secret: Arc::new(config.livekit_api_secret.clone()),
    };

    let router = axum::Router::new()
        .merge(router::init_router(app_state.clone()))
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api")
                .url("/api/api.json", swagger::ApiDoc::openapi())
                .config(
                    utoipa_swagger_ui::Config::default()
                        .doc_expansion("none")
                        .display_request_duration(true),
                ),
        )
        .with_state(app_state)
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(cors);

    (router, config)
}
