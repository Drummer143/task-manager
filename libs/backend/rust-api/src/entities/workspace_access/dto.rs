use serde::Deserialize;
use uuid::Uuid;

use super::model::Role;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateWorkspaceAccessDto {
    pub user_id: Uuid,
    pub role: Role,
    pub workspace_id: Uuid,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateWorkspaceAccessDto {
    pub user_id: Uuid,
    pub role: Option<Role>,
    pub workspace_id: Uuid,
}
