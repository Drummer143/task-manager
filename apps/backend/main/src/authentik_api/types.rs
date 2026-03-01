use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// internal, external, service_account, internal_service_account
// #[derive(Debug, Serialize, Deserialize)]
// pub enum AuthentikUserType {
//     ServiceAccount,
//     InternalServiceAccount,
//     Internal,
//     External,
// }

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthentikUser {
    pub pk: i128,
    pub username: String,
    pub name: String,
    pub is_active: bool,
    pub email: Option<String>,
    pub avatar: String,
    pub uuid: Uuid,

    // pub uid: String,
    // pub is_superuser: bool,
    // pub attributes: Option<serde_json::Value>,
    // pub path: String,
    // pub r#type: AuthentikUserType,

    // pub groups: Option<Vec<Uuid>>,
    // pub groups_obj: Option<serde_json::Value>,
    // pub roles: Option<Vec<Uuid>>,
    // pub roles_obj: Option<serde_json::Value>,

    // pub last_updated: DateTime<Utc>,
    // pub date_joined: DateTime<Utc>,
    // pub last_login: Option<DateTime<Utc>>,
    // pub password_change_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
pub struct UpdateUserRequest {
    pub username: String,
    // pub name: String,
    pub is_active: bool,
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct Authentik400ErrorResponse {
    pub non_field_errors: Option<Vec<String>>,

    #[serde(flatten)]
    pub field_errors: HashMap<String, Vec<String>>,
}
