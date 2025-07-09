use sqlx::types::chrono::{DateTime, Utc};

#[derive(utoipa::ToSchema)]
pub struct UploadRequest {
    #[schema(value_type = String, format = Binary)]
    #[allow(dead_code)]
    pub file: String,
    #[allow(dead_code)]
    pub name: Option<String>,
}

#[derive(utoipa::ToSchema, serde::Serialize)]
pub struct UploadResponse {
    pub link: String,
    pub name: String,
    pub size: i64,
    pub created_at: DateTime<Utc>,
}
