use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sql::{
    user::model::User,
    workspace::model::{Role, Workspace, WorkspaceWithRole},
};
use uuid::Uuid;

use crate::entities::page::dto::PageSummary;

// WORKSPACE

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreateWorkspaceRequest {
    pub name: String,
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

impl From<WorkspaceWithRole> for WorkspaceResponse {
    fn from(value: WorkspaceWithRole) -> Self {
        Self {
            id: value.id,
            name: value.name,
            role: Some(value.role),
            owner: None,
            updated_at: value.updated_at,
            created_at: value.created_at,
            deleted_at: value.deleted_at,
        }
    }
}

#[derive(serde::Deserialize)]
pub struct WorkspaceListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub search: Option<String>,
    pub sort_by: Option<crate::entities::workspace::db::WorkspaceSortBy>,
    pub sort_order: Option<sql::shared::types::SortOrder>,
}

// WORKSPACE ACCESS

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateWorkspaceAccessRequest {
    pub user_id: Uuid,
    pub role: Role,
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspaceAccessRequest {
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

#[derive(Debug, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct DetailedWorkspaceResponse {
    pub id: Uuid,
    pub name: String,
    pub role: Role,

    pub owner: User,
    pub pages: Vec<PageSummary>,

    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}
