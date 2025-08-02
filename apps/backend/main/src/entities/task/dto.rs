use chrono::{DateTime, Utc};
use rust_api::entities::{task::model::Task, user::model::User};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::entities::board_statuses::dto::BoardStatusResponseDto;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskDto {
    pub title: String,
    pub status_id: Uuid,
    pub description: Option<serde_json::Value>,
    pub due_date: Option<DateTime<Utc>>,
    pub assignee_id: Option<Uuid>,
}

#[derive(Debug, Serialize, utoipa::ToSchema, Clone)]
pub struct TaskResponse {
    pub id: Uuid,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub due_date: Option<DateTime<Utc>>,
    pub position: i32,

    pub status: Option<BoardStatusResponseDto>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reporter: Option<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub assignee: Option<User>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<Task> for TaskResponse {
    fn from(value: Task) -> Self {
        Self {
            id: value.id,
            title: value.title,
            description: None,
            due_date: value.due_date,
            position: value.position,
            status: None,
            reporter: None,
            assignee: None,
            created_at: value.created_at,
            updated_at: value.updated_at,
            deleted_at: value.deleted_at,
        }
    }
}

impl axum::response::IntoResponse for TaskResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}
