use axum::response::IntoResponse;
use serde::Serialize;

#[derive(Serialize, utoipa::ToSchema)]
pub struct UploadResponse {
    pub link: String,
}

impl IntoResponse for UploadResponse {
    fn into_response(self) -> axum::response::Response {
        (axum::http::StatusCode::CREATED, axum::Json(self)).into_response()
    }
}

#[derive(utoipa::ToSchema)]
pub struct UploadRequest {
    #[schema(value_type = String, format = Binary)]
    #[allow(dead_code)]
    pub file: String,
    #[allow(dead_code)]
    pub folder: Option<String>,
}
