use chrono::{DateTime, Utc};
use uuid::Uuid;

use repo::entities::page_access::model::Role;

#[derive(Debug, serde::Serialize, utoipa::ToSchema, Clone)]
pub struct PageAccessResponse {
    pub id: Uuid,
    pub user: repo::entities::user::model::User,
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
