use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskDto {
    pub title: String,
    pub status_id: Uuid,
    pub description: Option<serde_json::Value>,
    pub due_date: Option<DateTime<Utc>>,
    pub assignee_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTaskDto {
    pub title: Option<String>,
    pub status_id: Option<Uuid>,
    pub description: Option<serde_json::Value>,
    pub due_date: Option<DateTime<Utc>>,
    pub assignee_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ChangeStatusDto {
    pub status_id: Uuid,
}
