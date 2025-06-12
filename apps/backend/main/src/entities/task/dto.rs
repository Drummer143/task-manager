use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::entities::user::model::User;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskDto {
    pub title: String,
    pub status: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub assignee_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTaskDto {
    pub title: Option<String>,
    pub status: Option<String>,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub assignee_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct ChangeStatusDto {
    pub status: String,
}

#[derive(Debug, Serialize, utoipa::ToSchema, Clone)]
pub struct TaskResponse {
    pub id: Uuid,
    pub title: String,
    pub status: String,
    pub description: Option<String>,
    pub due_date: Option<DateTime<Utc>>,

    pub reporter: Option<User>,
    pub assignee: Option<User>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<super::model::Task> for TaskResponse {
    fn from(value: super::model::Task) -> Self {
        Self {
            id: value.id,
            title: value.title,
            status: value.status,
            description: value.description,
            due_date: value.due_date,
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
