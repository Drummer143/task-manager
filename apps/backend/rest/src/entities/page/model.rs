use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, utoipa::ToSchema)]
pub struct Page {
    pub id: Uuid,
    pub r#type: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing)]
    pub owner_id: Uuid,
    #[serde(skip_serializing)]
    pub workspace_id: Uuid,
    #[serde(skip_serializing)]
    pub parent_page_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
