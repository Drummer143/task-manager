use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;

use rust_api::entities::page_access::model::Role;

#[derive(Debug, utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePageAccessDto {
    pub user_id: Uuid,
    pub role: Role,
}

#[derive(Debug, utoipa::ToSchema, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePageAccessDto {
    pub user_id: Uuid,
    pub role: Option<Role>,
}

#[derive(Debug, serde::Serialize, utoipa::ToSchema, Clone)]
pub struct PageAccessResponse {
    pub id: Uuid,
    pub user: rust_api::entities::user::model::User,
    pub role: Role,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl axum::response::IntoResponse for PageAccessResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}
