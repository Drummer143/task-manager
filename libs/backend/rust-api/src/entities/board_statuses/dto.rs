use std::collections::HashMap;

use sqlx::types::Json;
use uuid::Uuid;

use crate::entities::board_statuses::model::BoardStatusType;

pub struct CreateBoardStatusDto {
    pub code: String,
    pub r#type: BoardStatusType,
    pub page_id: Uuid,
    pub position: i32,
    pub initial: Option<bool>,
    pub parent_status_id: Option<Uuid>,
    pub localizations: Json<HashMap<String, String>>,
}

pub struct UpdateBoardStatusDto {
    pub initial: Option<bool>,
    pub position: Option<i32>,
    pub localizations: Option<Json<HashMap<String, String>>>,
}
