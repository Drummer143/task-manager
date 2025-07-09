use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Clone, utoipa::ToSchema, Serialize, sqlx::FromRow)]
pub struct Asset {
    pub id: Uuid,
    pub name: String,
    pub path: String,
    pub size: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_accessed_at: Option<DateTime<Utc>>,
}
