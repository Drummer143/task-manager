use std::fmt;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use sql::{user::model::User, shared::traits::UpdateDto};

#[derive(Debug, Deserialize)]
pub struct CreateUserDto {
    pub id: Option<Uuid>,
    pub email: Option<String>,
    pub username: String,
    pub authentik_id: i32,

    pub picture: Option<String>,
    #[allow(dead_code)]
    pub is_active: Option<bool>,

    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserDto {
    pub username: Option<String>,
    pub is_active: Option<bool>,

    pub email: Option<Option<String>>,
    pub picture: Option<Option<String>>,
}

impl UpdateDto for UpdateUserDto {
    type Model = User;

    fn is_empty(&self) -> bool {
        self.email.is_none()
            && self.username.is_none()
            && self.picture.is_none()
            && self.is_active.is_none()
    }
}

/// The `query` field should be empty if there is an `email` or `username` field
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct UserFilterBy {
    pub email: Option<String>,
    pub username: Option<String>,
    pub query: Option<String>,
    pub workspace_id: Option<Uuid>,
    pub exclude: Option<Vec<Uuid>>,
}

impl UserFilterBy {
    pub fn is_empty(&self) -> bool {
        self.email.is_none()
            && self.username.is_none()
            && self.query.is_none()
            && self.exclude.is_none()
            && self.workspace_id.is_none()
    }

    pub fn has_any_user_filter(&self) -> bool {
        self.email.is_some() || self.username.is_some() || self.exclude.is_some()
    }

    pub fn is_valid(&self) -> bool {
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
