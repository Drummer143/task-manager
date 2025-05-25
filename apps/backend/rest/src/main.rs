use axum::http;
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::OpenApi;

mod entities;
mod middleware;
mod shared;
mod types;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        entities::user::controller::get_list::get_list,
        entities::user::controller::get_by_id::get_by_id,
        entities::auth::controller::login::login,
        entities::auth::controller::register::register,
    ),
    components(schemas(
        entities::user::model::User,
        entities::user_credentials::model::UserCredentials,
        shared::error_handlers::handlers::ErrorResponse,
        entities::user::dto::UserSortBy,
        types::pagination::SortOrder,
        types::pagination::Meta,
    ))
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL not found");
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET not found");

    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to database");

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

    let app = axum::Router::new()
        .merge(entities::user::router::init())
        .merge(entities::auth::router::init())
        .merge(entities::workspace::router::init())
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api").url("/api/openapi.json", ApiDoc::openapi()),
        )
        .with_state(types::app_state::AppState {
            db,
            jwt_secret: jwt_secret.as_bytes().to_vec(),
        })
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let port = std::env::var("PORT").unwrap_or("3000".to_string());
    let addr = format!("0.0.0.0:{}", port);

    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
