use serde::Deserialize;
use uuid::Uuid;

use crate::{
    entities::page::model::{Page, PageType, Role},
    shared::{tiptap_content::TipTapContent, traits::UpdateDto},
};

// PAGE

#[derive(Debug)]
pub struct CreatePageDto {
    pub title: String,
    pub parent_page_id: Option<Uuid>,
    pub r#type: PageType,
    pub content: Option<TipTapContent>,
    pub workspace_id: Uuid,
    pub owner_id: Uuid,
}

#[derive(Debug)]
pub struct UpdatePageDto {
    pub title: Option<String>,
}

impl UpdateDto for UpdatePageDto {
    type Model = Page;

    fn is_empty(&self) -> bool {
        self.title.is_none()
    }

    fn has_changes(&self, _: &Self::Model) -> bool {
        todo!("has_changes for UpdatePageDto")
    }
}

// PAGE ACCESS

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreatePageAccessDto {
    pub user_id: Uuid,
    pub role: Role,
    pub page_id: Uuid,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct UpdatePageAccessDto {
    pub user_id: Uuid,
    pub role: Option<Role>,
    pub page_id: Uuid,
}
