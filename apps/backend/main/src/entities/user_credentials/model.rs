use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UserCredentials {
    pub id: Uuid,
    pub password_hash: String,
    pub password_reset_token: Option<String>,
    pub email_verification_token: Option<String>,
    pub user_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}
