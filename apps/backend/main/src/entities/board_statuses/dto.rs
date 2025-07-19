use std::collections::HashMap;

use rust_api::entities::board_statuses::model::BoardStatusType;
use serde::Serialize;
use uuid::Uuid;

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

#[derive(utoipa::ToSchema, Serialize)]
pub struct FullBoardStatusResponseDto {
    pub id: Uuid,
    pub code: String,
    pub r#type: BoardStatusType,
    pub position: i32,
    pub initial: bool,
    pub localizations: HashMap<String, String>,
}
