use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use std::collections::HashMap;

use super::codes;

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct ErrorResponse {
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_code: Option<String>,
    pub status_code: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dev_details: Option<String>,
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> Response {
        let status =
            StatusCode::from_u16(self.status_code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
        (status, Json(self)).into_response()
    }
}

impl ErrorResponse {
    pub fn bad_request(
        error_code: codes::BadRequestErrorCode,
        details: Option<HashMap<String, String>>,
    ) -> ErrorResponse {
        ErrorResponse {
            error: "Bad request".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::BAD_REQUEST.as_u16(),
            details,
            dev_details: None,
        }
    }

    pub fn unauthorized(error_code: codes::UnauthorizedErrorCode) -> ErrorResponse {
        ErrorResponse {
            error: "Unauthorized".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::UNAUTHORIZED.as_u16(),
            details: None,
            dev_details: None,
        }
    }

    pub fn forbidden(
        error_code: codes::ForbiddenErrorCode,
        details: Option<HashMap<String, String>>,
    ) -> ErrorResponse {
        ErrorResponse {
            error: "Forbidden".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::FORBIDDEN.as_u16(),
            details,
            dev_details: None,
        }
    }

    pub fn not_found(
        error_code: codes::NotFoundErrorCode,
        details: Option<HashMap<String, String>>,
    ) -> ErrorResponse {
        ErrorResponse {
            error: "Not found".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::NOT_FOUND.as_u16(),
            details,
            dev_details: None,
        }
    }

    pub fn internal_server_error(dev_details: Option<String>) -> ErrorResponse {
        ErrorResponse {
            error: "Internal server error".into(),
            error_code: Some("internal_server_error".to_string()),
            status_code: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
            details: None,
            dev_details
        }
    }
}

impl From<sqlx::Error> for ErrorResponse {
    fn from(error: sqlx::Error) -> Self {
        match error {
            sqlx::Error::RowNotFound => Self::not_found(codes::NotFoundErrorCode::NotFound, None),
            _ => Self::internal_server_error(Some(error.to_string())),
        }
    }
}

impl From<mongodb::error::Error> for ErrorResponse {
    fn from(error: mongodb::error::Error) -> Self {
        Self::internal_server_error(Some(error.to_string()))
    }
}
