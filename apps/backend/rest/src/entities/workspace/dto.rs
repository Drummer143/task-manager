use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::entities::{page::model::Page, user::model::User, workspace_access::workspace_access::Role};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateWorkspaceDto {
    pub name: String,
    pub owner_id: Uuid,
}

pub struct WorkspaceInfo {
    pub workspace: super::model::Workspace,
    pub role: Role,
    pub owner: Option<User>,
    pub pages: Option<Vec<Page>>,
}

#[derive(Debug, Serialize)]
pub struct WorkspaceResponse {
    pub id: Uuid,
    pub name: String,
    pub role: Role,

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
