use chrono::{DateTime, Utc};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, FromRow, Clone)]
pub struct Task {
    pub id: Uuid,
    pub title: String,
    pub status: String,
    pub description: Option<String>,
    pub due_date: Option<DateTime<Utc>>,
    pub page_id: Uuid,
    pub assignee_id: Option<Uuid>,
    pub reporter_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
