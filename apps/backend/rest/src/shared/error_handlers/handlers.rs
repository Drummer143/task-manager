use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use std::{borrow::Cow, collections::HashMap};

use super::codes;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    error: Cow<'static, str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error_code: Option<String>,
    status_code: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<HashMap<String, String>>,
}

impl IntoResponse for ErrorResponse {
    fn into_response(self) -> Response {
        let status =
            StatusCode::from_u16(self.status_code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
        (status, Json(self)).into_response()
    }
}

impl ErrorResponse {
    pub fn from_query_rejection(e: axum::extract::rejection::QueryRejection) -> ErrorResponse {
        Self {
            error: e.body_text().to_string().into(),
            error_code: None,
            status_code: e.status().as_u16(),
            details: None,
        }
    }

    pub fn bad_request(error_code: codes::BadRequestErrorCode, details: Option<HashMap<String, String>>) -> ErrorResponse {
        ErrorResponse {
            error: "Bad request".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::BAD_REQUEST.as_u16(),
            details,
        }
    }

    pub fn unauthorized(error_code: &str) -> ErrorResponse {
        ErrorResponse {
            error: "Unauthorized".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::UNAUTHORIZED.as_u16(),
            details: None,
        }
    }

    pub fn forbidden(error_code: &str, details: Option<HashMap<String, String>>) -> ErrorResponse {
        ErrorResponse {
            error: "Forbidden".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::FORBIDDEN.as_u16(),
            details,
        }
    }

    pub fn not_found(error_code: &str, details: Option<HashMap<String, String>>) -> ErrorResponse {
        ErrorResponse {
            error: "Not found".into(),
            error_code: Some(error_code.to_string()),
            status_code: StatusCode::NOT_FOUND.as_u16(),
            details,
        }
    }

    pub fn internal_server_error() -> ErrorResponse {
        ErrorResponse {
            error: "Internal server error".into(),
            error_code: Some("internal_server_error".to_string()),
            status_code: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
            details: None,
        }
    }
}
