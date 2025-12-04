// use std::fs;

use axum::{Json /* , extract::State */};
use chrono::{DateTime, Utc};
use error_handlers::handlers::ErrorResponse;
use serde::{Deserialize, Serialize};
// use rust_api::shared::traits::PostgresqlRepositoryCreate;
use uuid::Uuid;

// use crate::shared::traits::ServiceCreateMethod;

#[derive(Deserialize, Serialize, utoipa::ToSchema)]
// #[derive(serde)]
pub struct UserData {
    pk: u64,
    uuid: Uuid,
    email: Option<String>,
    username: String,
    is_active: bool,
    created_at: DateTime<Utc>,
}

#[derive(Deserialize, Serialize, utoipa::ToSchema)]
pub struct UserDeletedData {
    pk: u64,
}

#[derive(Deserialize, Serialize, utoipa::ToSchema)]
#[serde(tag = "event", content = "payload")]
#[serde(rename_all = "snake_case")]
pub enum Events {
    UserCreated(UserData),
    UserUpdated(UserData),
    UserDeleted(UserDeletedData),
}

#[utoipa::path(
    post,
    path = "/webhooks/authentik/user_sync",
    request_body = Events,
    responses(
        (status = 200, description = "User created successfully"),
        (status = 400, description = "Invalid request body", body = error_handlers::handlers::ErrorResponse),
    ),
    tags = ["Webhooks"],
)]
pub async fn user_sync(
    // State(state): State<crate::types::app_state::AppState>,
    Json(payload): Json<Events>,
) -> Result<axum::http::StatusCode, ErrorResponse> {
    let timestamp = Utc::now().format("%Y-%m-%d_%H-%M-%S_%f").to_string();

    let action = match payload {
        Events::UserCreated(_) => "created",
        Events::UserUpdated(_) => "updated",
        Events::UserDeleted(_) => "deleted",
    };

    let filename = format!("user_{}_{}.json", action, timestamp);

    let content = match serde_json::to_string_pretty(&payload) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Ошибка сериализации JSON: {}", e);
            return Ok(axum::http::StatusCode::OK);
        }
    };

    match tokio::fs::write(&filename, content).await {
        Ok(_) => {
            println!("Файл успешно сохранен: {}", filename);
            Ok(axum::http::StatusCode::OK)
        }
        Err(e) => {
            eprintln!("Ошибка записи файла: {}", e);
            Ok(axum::http::StatusCode::OK)
        }
    }

    // use rust_api::entities::user;

    // let user = user::UserRepository::create(
    //     &state.postgres,
    //     user::dto::CreateUserDto {
    //         email: payload.email,
    //         username: payload.username,
    //         id: Some(payload.id),
    //         created_at: Some(payload.created_at),
    //         picture: None,
    //     },
    // )
    // .await;

    // if let Err(err) = user {
    //     return Err(ErrorResponse::internal_server_error(Some(err.to_string())));
    // }

    // let user = user.unwrap();

    // crate::entities::workspace::WorkspaceService::create(
    //     &state,
    //     rust_api::entities::workspace::dto::CreateWorkspaceDto {
    //         name: format!("{}'s workspace", user.username),
    //         owner_id: user.id,
    //     },
    // )
    // .await?;

    // Ok(axum::http::StatusCode::CREATED)
}
