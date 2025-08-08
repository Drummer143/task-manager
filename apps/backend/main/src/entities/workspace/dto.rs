use chrono::{DateTime, Utc};
use rust_api::entities::{user::model::User, workspace::model::Workspace, workspace_access::model::Role};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::entities::page::dto::PageResponseWithoutInclude;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreateWorkspaceDto {
    pub name: String,
}

#[derive(Debug, utoipa::ToSchema)]
pub struct WorkspaceInfo {
    pub workspace: rust_api::entities::workspace::model::Workspace,
    pub role: Option<Role>,
    pub owner: Option<User>,
    pub pages: Option<Vec<PageResponseWithoutInclude>>,
}

#[derive(Debug, Serialize, utoipa::ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceResponseWithoutInclude {
    pub id: Uuid,
    pub name: String,
    pub role: Option<Role>,

    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl From<Workspace> for WorkspaceResponseWithoutInclude {
    fn from(value: Workspace) -> Self {
        Self {
            id: value.id,
            name: value.name,
            role: None,
            updated_at: value.updated_at,
            created_at: value.created_at,
            deleted_at: value.deleted_at,
        }
    }
}

#[derive(Debug, Serialize, utoipa::ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceResponse {
    pub id: Uuid,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub pages: Option<Vec<PageResponseWithoutInclude>>,
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

impl From<Workspace> for WorkspaceResponse {
    fn from(value: Workspace) -> Self {
        Self {
            id: value.id,
            name: value.name,
            role: None,
            pages: None,
            owner: None,
            updated_at: value.updated_at,
            created_at: value.created_at,
            deleted_at: value.deleted_at,
        }
    }
}

impl axum::response::IntoResponse for WorkspaceResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
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
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<Include>>,
}

#[derive(serde::Deserialize)]
pub struct GetListQueryDto {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub search: Option<String>,
    pub sort_by: Option<rust_api::entities::workspace::dto::WorkspaceSortBy>,
    pub sort_order: Option<rust_api::shared::types::SortOrder>,
    #[serde(
        default,
        deserialize_with = "crate::shared::deserialization::deserialize_comma_separated_query_param"
    )]
    pub include: Option<Vec<Include>>,
}
