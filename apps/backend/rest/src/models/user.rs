use std::fmt;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub username: String,
    pub email_verified: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub picture: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl axum::response::IntoResponse for User {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
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
        self.email.is_none() && self.username.is_none() && self.query.is_none() && self.exclude.is_none()
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
