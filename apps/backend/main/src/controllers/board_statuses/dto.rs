use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBoardStatusRequest {
    pub position: i32,
    pub localizations: HashMap<String, String>,
    pub initial: Option<bool>,
}

#[derive(Debug, Clone, utoipa::ToSchema, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardStatusResponse {
    pub id: Uuid,
    // pub position: i32,
    pub title: String,
    pub initial: bool,
}
