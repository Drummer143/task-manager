use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sql::{shared::tiptap_content::TipTapContent, task::model::Task, user::model::User};
use uuid::Uuid;

use crate::entities::board_statuses::dto::BoardStatusResponse;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskRequest {
    pub title: String,
    pub status_id: Uuid,
    pub description: Option<TipTapContent>,
    pub due_date: Option<DateTime<Utc>>,
    pub assignee_id: Option<Uuid>,
}

#[derive(Debug, Serialize, utoipa::ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TaskResponse {
    pub id: Uuid,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<TipTapContent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub due_date: Option<DateTime<Utc>>,
    pub position: i32,
    pub is_draft: bool,
    pub page_id: Uuid,

    pub status: Option<BoardStatusResponse>,
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
            description: value.description.0,
            due_date: value.due_date,
            position: value.position,
            is_draft: value.is_draft,
            page_id: value.page_id,
            status: None,
            reporter: None,
            assignee: None,
            created_at: value.created_at,
            updated_at: value.updated_at,
            deleted_at: value.deleted_at,
        }
    }
}
