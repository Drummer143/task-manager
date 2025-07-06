use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub username: String,
    pub email_verified: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub picture: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
