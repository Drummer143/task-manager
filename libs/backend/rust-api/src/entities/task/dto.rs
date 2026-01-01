use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;

use crate::{entities::{page::model::Doc, task::model::Task}, shared::traits::UpdateDto};

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskDto {
    pub title: String,
    pub status_id: Uuid,
    pub position: i32,
    pub description: Option<Doc>,
    pub due_date: Option<DateTime<Utc>>,
    pub assignee_id: Option<Uuid>,
    pub reporter_id: Uuid,
    pub page_id: Uuid,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTaskDto {
    pub title: Option<String>,
    pub status_id: Option<Uuid>,
    pub position: Option<i32>,

    pub description: Option<Option<Doc>>,
    pub due_date: Option<Option<DateTime<Utc>>>,
    pub assignee_id: Option<Option<Uuid>>,
}

impl UpdateDto for UpdateTaskDto {
    type Model = Task;

    fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.status_id.is_none()
            && self.position.is_none()
            && self.description.is_none()
            && self.due_date.is_none()
            && self.assignee_id.is_none()
    }

    fn has_changes(&self, _: &Self::Model) -> bool {
        todo!("has_changes for UpdateTaskDto")
    }
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ChangeStatusDto {
    pub status_id: Uuid,
}
