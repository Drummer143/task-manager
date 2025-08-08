use std::collections::HashMap;

use sqlx::types::Json;
use uuid::Uuid;

use crate::shared::traits::UpdateDto;

pub struct CreateBoardStatusDto {
    pub page_id: Uuid,
    pub position: i32,
    pub initial: Option<bool>,
    // pub parent_status_id: Option<Uuid>,
    pub localizations: Json<HashMap<String, String>>,
}

pub struct UpdateBoardStatusDto {
    pub initial: Option<bool>,
    pub position: Option<i32>,
    pub localizations: Option<Json<HashMap<String, String>>>,
    // pub parent_status_id: Option<Option<Uuid>>,
}

impl UpdateDto for UpdateBoardStatusDto {
    fn is_empty(&self) -> bool {
        self.initial.is_none()
            && self.position.is_none()
            && self.localizations.is_none()
            // && self.parent_status_id.is_none()
    }
}
