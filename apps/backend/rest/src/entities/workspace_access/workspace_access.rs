use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Role {
    Owner,
    Admin,
    Member,
    Commentator,
    Guest,
}

impl From<String> for Role {
    fn from(value: String) -> Self {
        match value.as_str() {
            "owner" => Self::Owner,
            "admin" => Self::Admin,
            "member" => Self::Member,
            "commentator" => Self::Commentator,
            "guest" => Self::Guest,
            _ => unreachable!(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct WorkspaceAccess {
    pub id: Uuid,
    #[serde(skip_serializing)]
    pub user_id: Uuid,
    #[serde(skip_serializing)]
    pub workspace_id: Uuid,
    pub role: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
