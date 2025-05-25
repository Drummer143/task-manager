use std::fmt;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateUserDto {
    pub email: String,
    pub username: String,
    pub picture: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserDto {
    pub email: Option<String>,
    pub username: Option<String>,
    pub picture: Option<String>,
}

impl crate::shared::traits::IsEmpty for UpdateUserDto {
    fn is_empty(&self) -> bool {
        self.email.is_none() && self.username.is_none() && self.picture.is_none()
    }
}

/// The `query` field should be empty if there is an `email` or `username` field
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserFilterBy {
    pub email: Option<String>,
    pub username: Option<String>,
    pub query: Option<String>,
    pub exclude: Option<Vec<Uuid>>,
}

impl crate::shared::traits::IsEmpty for UserFilterBy {
    fn is_empty(&self) -> bool {
        self.email.is_none()
            && self.username.is_none()
            && self.query.is_none()
            && self.exclude.is_none()
    }
}

impl crate::shared::traits::IsValid for UserFilterBy {
    fn is_valid(&self) -> bool {
        if self.email.is_some() || self.username.is_some() {
            self.query.is_none()
        } else {
            true
        }
    }
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
