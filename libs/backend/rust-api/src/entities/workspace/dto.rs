use serde::Deserialize;
use uuid::Uuid;

use crate::shared::traits::UpdateDto;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspaceDto {
    pub name: Option<String>,
}

impl UpdateDto for UpdateWorkspaceDto {
    fn is_empty(&self) -> bool {
        self.name.is_none()
    }
}

#[derive(Debug)]
pub struct CreateWorkspaceDto {
    pub name: String,
    pub owner_id: Uuid,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum WorkspaceSortBy {
    Name,
    CreatedAt,
    UpdatedAt,
}

impl std::fmt::Display for WorkspaceSortBy {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            WorkspaceSortBy::Name => write!(f, "name"),
            WorkspaceSortBy::CreatedAt => write!(f, "created_at"),
            WorkspaceSortBy::UpdatedAt => write!(f, "updated_at"),
        }
    }
}
