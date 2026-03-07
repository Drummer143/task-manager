use axum::http;
use std::sync::Arc;
use utils::{auth_middleware::InternalAuthState, types::jwks::JwkSet};
use utoipa::OpenApi;

use crate::{config::Config, types::app_state::AppState};

mod authentik_api;
mod config;
mod db_connections;
mod entities;
mod middleware;
mod repos;
mod shared;
mod swagger;
mod types;
mod webhooks;
mod services;

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
        jwt_secret: Arc::new(config.jwt_secret.clone()),
        authentik_api_url: Arc::new(config.authentik_api_url.clone()),
        authentik_api_token: Arc::new(config.authentik_api_token.clone()),
        storage_service_url: Arc::new(config.storage_service_url.clone()),
    };

    let router = axum::Router::new()
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

    (router, config)
}
