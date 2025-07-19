use std::collections::HashMap;

use uuid::Uuid;

use crate::entities::board_statuses::model::BoardStatusType;

#[derive(utoipa::ToSchema, serde::Deserialize)]
pub struct CreateBoardStatusDto {
    pub code: String,
    pub r#type: BoardStatusType,
    pub page_id: Uuid,
    pub position: i32,
    pub initial: Option<bool>,
    pub parent_status_id: Option<Uuid>,
    pub localizations: HashMap<String, String>,
}

#[derive(utoipa::ToSchema, serde::Deserialize)]
pub struct UpdateBoardStatusDto {
    pub initial: Option<bool>,
    pub position: Option<i32>,
    pub localizations: Option<HashMap<String, String>>,
}

pub enum StatusShiftDirection {
    Less,
    Greater,
}

pub enum StatusShiftAction {
    Increment,
    Decrement,
}
