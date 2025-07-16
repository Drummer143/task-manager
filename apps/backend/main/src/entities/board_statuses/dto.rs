use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use rust_api::entities::board_statuses::model::BoardStatusType;
use uuid::Uuid;

#[derive(utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBoardStatusDto {
    pub code: String,
    pub r#type: BoardStatusType,
    pub position: i32,
    pub localizations: HashMap<String, String>,
    pub parent_status_id: Option<Uuid>,
    pub initial: Option<bool>,
}

#[derive(utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateBoardStatusDto {
    pub initial: Option<bool>,
    pub position: Option<i32>,
    pub localizations: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, utoipa::ToSchema, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardStatusResponseDto {
    pub id: Uuid,
    pub code: String,
    pub r#type: BoardStatusType,
    pub position: i32,
    pub title: String,
    pub initial: bool,
}
