use chrono::{DateTime, Utc};
use rust_api::entities::workspace_access::model::Role;
use uuid::Uuid;

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
pub struct CreateWorkspaceAccessDto {
    pub user_id: Uuid,
    pub role: Role,
}

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
pub struct UpdateWorkspaceAccessDto {
    pub user_id: Uuid,
    pub role: Option<Role>,
}

#[derive(Debug, serde::Serialize, utoipa::ToSchema, Clone)]
pub struct WorkspaceAccessResponse {
    pub id: Uuid,
    pub user: rust_api::entities::user::model::User,
    pub role: Role,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<DateTime<Utc>>,
}

impl axum::response::IntoResponse for WorkspaceAccessResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::OK, axum::Json(self)).into_response()
    }
}
