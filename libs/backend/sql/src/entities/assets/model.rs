use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, utoipa::ToSchema, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
pub enum EntityType {
    PageText,
    TaskDescription,
    UserAvatar,
}

#[derive(Debug, Clone, utoipa::ToSchema, Serialize, Deserialize, sqlx::FromRow)]
pub struct Asset {
    pub id: Uuid,
    pub name: String,
    pub blob_id: Uuid,
    pub entity_id: Uuid,
    pub entity_type: EntityType,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
