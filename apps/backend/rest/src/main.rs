use axum::routing::get;
use sqlx::postgres::PgPoolOptions;
use utoipa::OpenApi;

mod controllers;
mod dto;
mod models;
mod repositories;
mod services;
mod shared;
mod types;

#[derive(utoipa::OpenApi)]
#[openapi(
    paths(
        controllers::user_controller::get_list::get_list,
        controllers::user_controller::get_by_id::get_by_id,
    ),
    components(schemas(
        models::user::User,
        shared::error_handlers::handlers::ErrorResponse,
        models::user::UserSortBy,
        types::pagination::SortOrder,
        types::pagination::Meta,
    ))
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    tracing_subscriber::fmt::init();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL not found");

    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to database");

    let app = axum::Router::new()
        .route(
            "/users/{id}",
            get(controllers::user_controller::get_by_id::get_by_id),
        )
        .route(
            "/users",
            get(controllers::user_controller::get_list::get_list),
        )
        .merge(
            utoipa_swagger_ui::SwaggerUi::new("/api").url("/api/openapi.json", ApiDoc::openapi()),
        )
        .with_state(types::app_state::AppState { db });

    let addr = "0.0.0.0:3000";

    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
