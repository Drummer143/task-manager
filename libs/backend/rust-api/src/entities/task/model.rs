use chrono::{DateTime, Utc};
use sqlx::FromRow;
use uuid::Uuid;

use crate::entities::page::model::Doc;

#[derive(Debug, FromRow, Clone)]
pub struct Task {
    pub id: Uuid,
    pub title: String,
    pub status_id: Uuid,
    pub description: Option<sqlx::types::Json<Doc>>,
    pub due_date: Option<DateTime<Utc>>,
    pub position: i32,
    pub page_id: Uuid,
    pub assignee_id: Option<Uuid>,
    pub reporter_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
