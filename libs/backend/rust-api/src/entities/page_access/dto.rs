use serde::Deserialize;
use uuid::Uuid;

use super::model::Role;

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct CreatePageAccessDto {
    pub user_id: Uuid,
    pub role: Role,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct UpdatePageAccessDto {
    pub user_id: Uuid,
    pub role: Option<Role>,
}
