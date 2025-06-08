use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::entities::{page::model::Page, user::model::User, workspace_access::model::Role};

#[derive(Debug, Deserialize)]
pub struct WorkspaceDto {
    pub name: String,
    pub owner_id: Uuid,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct WorkspaceRequestDto {
    pub name: String,
}

#[derive(Debug, utoipa::ToSchema)]
pub struct WorkspaceInfo {
    pub workspace: super::model::Workspace,
    pub role: Option<Role>,
    pub owner: Option<User>,
    pub pages: Option<Vec<Page>>,
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct WorkspaceResponse {
    pub id: Uuid,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub pages: Option<Vec<Page>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<User>,

    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<WorkspaceInfo> for WorkspaceResponse {
    fn from(value: WorkspaceInfo) -> Self {
        Self {
            id: value.workspace.id,
            name: value.workspace.name,
            role: value.role,
            pages: value.pages,
            owner: value.owner,
            updated_at: value.workspace.updated_at,
            created_at: value.workspace.created_at,
            deleted_at: value.workspace.deleted_at,
        }
    }
}

impl From<&WorkspaceInfo> for WorkspaceResponse {
    fn from(value: &WorkspaceInfo) -> Self {
        Self {
            id: value.workspace.id,
            name: value.workspace.name.clone(),
            role: value.role.clone(),
            pages: value.pages.clone(),
            owner: value.owner.clone(),
            updated_at: value.workspace.updated_at,
            created_at: value.workspace.created_at,
            deleted_at: value.workspace.deleted_at,
        }
    }
}

impl axum::response::IntoResponse for WorkspaceResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, self).into_response()
    }
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
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

#[derive(PartialEq, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum Include {
    Owner,
    Pages,
}

impl std::str::FromStr for Include {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "owner" => Ok(Include::Owner),
            "pages" => Ok(Include::Pages),
            _ => unreachable!(),
        }
    }
}

#[derive(serde::Deserialize)]
pub struct GetWorkspaceQuery {
    pub include: Option<Vec<Include>>,
}

#[derive(serde::Deserialize)]
pub struct GetListQueryDto {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub search: Option<String>,
    pub sort_by: Option<WorkspaceSortBy>,
    pub sort_order: Option<crate::types::pagination::SortOrder>,
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<Include>>,
}
