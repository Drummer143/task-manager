use serde::Deserialize;
use uuid::Uuid;

use crate::{entities::page::model::PageType, shared::traits::UpdateDto};

#[derive(Debug, Deserialize, utoipa::ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PageTextDto {
    pub text: Option<String>,
    pub r#type: String,

    pub attrs: Option<serde_json::Value>,
    pub content: Option<serde_json::Value>,
    pub marks: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreatePageDto {
    pub title: String,
    pub parent_page_id: Option<Uuid>,
    pub r#type: PageType,
    pub text: Option<PageTextDto>,
    pub workspace_id: Uuid,
    pub owner_id: Uuid,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePageDto {
    pub title: Option<String>,
    pub text: Option<Option<PageTextDto>>,
}

impl UpdateDto for UpdatePageDto {
    fn is_empty(&self) -> bool {
        self.title.is_none() && self.text.is_none()
    }
}
