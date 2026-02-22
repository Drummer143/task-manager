use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sql::{
    user::model::User,
    workspace::model::{Role, Workspace},
};
use uuid::Uuid;

use crate::entities::page::dto::ChildPageResponse;

// WORKSPACE

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreateWorkspaceDto {
    pub name: String,
}

#[derive(Debug, utoipa::ToSchema)]
pub struct WorkspaceInfo {
    pub workspace: sql::workspace::model::Workspace,
    pub role: Option<Role>,
    pub owner: Option<User>,
}

#[derive(Debug, Serialize, utoipa::ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceResponse {
    pub id: Uuid,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<Role>,

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

#[derive(serde::Deserialize)]
pub struct GetListQueryDto {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub search: Option<String>,
    pub sort_by: Option<crate::entities::workspace::db::WorkspaceSortBy>,
    pub sort_order: Option<sql::shared::types::SortOrder>,
}

// WORKSPACE ACCESS

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateWorkspaceAccessDto {
    pub user_id: Uuid,
    pub role: Role,
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspaceAccessDto {
    pub user_id: Uuid,
    pub role: Option<Role>,
}

#[derive(Debug, serde::Serialize, utoipa::ToSchema, Clone)]
pub struct WorkspaceAccessResponse {
    pub id: Uuid,
    pub user: sql::user::model::User,
    pub role: Role,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl axum::response::IntoResponse for WorkspaceAccessResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DetailedWorkspaceResponse {
    pub id: Uuid,
    pub name: String,
    pub role: Role,

    pub owner: User,
    pub pages: Vec<ChildPageResponse>,

    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}
