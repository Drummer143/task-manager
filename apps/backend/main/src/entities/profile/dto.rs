use serde::{Serialize};

use sql::{user::model::User, workspace::model::Workspace};

#[derive(Serialize, utoipa::ToSchema)]
pub struct ProfileResponse {
    #[serde(flatten)]
    pub user: User,
    pub workspace: Workspace,
}
