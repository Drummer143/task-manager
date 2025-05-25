use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, FromRow, Deserialize, Serialize, Clone)]
pub struct Task {
    pub id: Uuid,
    pub title: String,
    pub status: String,
    pub description: Option<String>,
    pub due_date: Option<chrono::NaiveDateTime>,
    #[serde(skip_serializing)]
    pub page_id: Uuid,
    #[serde(skip_serializing)]
    pub assignee_id: Option<Uuid>,
    #[serde(skip_serializing)]
    pub reporter_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
