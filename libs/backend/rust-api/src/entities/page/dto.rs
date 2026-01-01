use uuid::Uuid;

use crate::{
    entities::page::model::{Doc, Page, PageType},
    shared::traits::UpdateDto,
};

#[derive(Debug)]
pub struct CreatePageDto {
    pub title: String,
    pub parent_page_id: Option<Uuid>,
    pub r#type: PageType,
    pub content: Option<Doc>,
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
