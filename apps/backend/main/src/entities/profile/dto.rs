use serde::{Deserialize, Serialize};

use sql::{user::model::User, workspace::model::Workspace};
use uuid::Uuid;

#[derive(Serialize, utoipa::ToSchema)]
pub struct ProfileResponse {
    #[serde(flatten)]
    pub user: User,
    pub workspace: Workspace,
}

#[derive(Debug, Deserialize, utoipa::ToSchema)]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub email: Option<Option<String>>,
    pub picture: Option<Option<String>>,
}

#[derive(serde::Deserialize)]
pub struct StorageBlobResponse {
    pub id: Uuid,
    #[allow(dead_code)]
    pub hash: String,
    #[allow(dead_code)]
    pub size: i64,
    #[allow(dead_code)]
    pub path: String,
    #[allow(dead_code)]
    pub mime_type: String,
}

#[derive(utoipa::ToSchema)]
pub struct UploadAvatarForm {
    #[allow(dead_code)]
    #[schema(format = "binary")]
    pub file: String,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    pub x: Option<f64>,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    pub y: Option<f64>,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    pub width: Option<f64>,

    #[allow(dead_code)]
    #[schema(nullable, minimum = 0.0)]
    height: Option<f64>,
}
