use std::fmt;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// The `query` field should be empty if there is an `email` or `username` field
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserFilterBy {
    pub email: Option<String>,
    pub username: Option<String>,
    pub query: Option<String>,
    pub exclude: Option<Vec<Uuid>>,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub enum UserSortBy {
    Email,
    Username,
    CreatedAt,
    UpdatedAt,
}

impl fmt::Display for UserSortBy {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            UserSortBy::Email => write!(f, "email"),
            UserSortBy::Username => write!(f, "username"),
            UserSortBy::CreatedAt => write!(f, "created_at"),
            UserSortBy::UpdatedAt => write!(f, "updated_at"),
        }
    }
}
