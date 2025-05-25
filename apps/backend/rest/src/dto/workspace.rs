use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::{page::Page, user::User, workspace::Workspace};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum WorkspaceRole {
    Owner,
    Admin,
    Member,
    Commentator,
    Guest,
}

impl From<String> for WorkspaceRole {
    fn from(value: String) -> Self {
        match value.as_str() {
            "owner" => Self::Owner,
            "admin" => Self::Admin,
            "member" => Self::Member,
            "commentator" => Self::Commentator,
            "guest" => Self::Guest,
            _ => unreachable!(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateWorkspaceDto {
    pub name: String,
    pub owner_id: Uuid,
}

pub struct WorkspaceInfo {
    pub workspace: Workspace,
    pub role: WorkspaceRole,
    pub owner: Option<User>,
    pub pages: Option<Vec<Page>>,
}

#[derive(Debug, Serialize)]
pub struct WorkspaceResponse {
    pub id: Uuid,
    pub name: String,
    pub role: WorkspaceRole,

    pub pages: Option<Vec<Page>>,
    pub owner: Option<User>,

    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
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

impl axum::response::IntoResponse for WorkspaceResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, self).into_response()
    }
}
