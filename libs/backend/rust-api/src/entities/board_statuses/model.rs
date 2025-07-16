use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{prelude::Type, types::Json};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, utoipa::ToSchema, Type)]
#[serde(rename_all = "camelCase")]
#[sqlx(rename_all = "snake_case", type_name = "board_status_type")]
pub enum BoardStatusType {
    SubStatus,
    MainStatus,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct BoardStatus {
    pub id: Uuid,
    pub page_id: Uuid,
    pub code: String,
    pub r#type: BoardStatusType,
    pub initial: bool,
    pub position: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub localizations: Json<HashMap<String, String>>,
}
