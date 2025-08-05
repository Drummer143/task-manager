use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBoardStatusDto {
    pub code: String,
    pub position: i32,
    pub localizations: HashMap<String, String>,
    // pub parent_status_id: Option<Uuid>,
    pub initial: Option<bool>,
}

#[derive(Debug, Clone, utoipa::ToSchema, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardStatusResponseDto {
    pub id: Uuid,
    // pub position: i32,
    pub title: String,
    pub initial: bool,
}

// #[derive(Debug, Clone, utoipa::ToSchema, Serialize)]
// #[serde(rename_all = "camelCase")]
// pub struct BoardStatusResponseDto {
//     #[serde(flatten)]
//     pub status: ChildBoardStatusResponseDto,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub child_statuses: Option<Vec<ChildBoardStatusResponseDto>>,
// }
