use serde::{Deserialize, Serialize};

use sql::{user::model::User, workspace::model::Workspace};

#[derive(Serialize, utoipa::ToSchema)]
pub struct ProfileResponse {
    #[serde(flatten)]
    pub user: User,
    pub workspace: Workspace,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub email: Option<Option<String>>,
    pub picture: Option<Option<String>>,
}
