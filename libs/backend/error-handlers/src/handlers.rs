use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use std::{borrow::Cow, collections::HashMap};

use super::codes;

#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct ErrorResponse {
    pub error: Cow<'static, str>,
    pub error_code: String,
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
    pub fn with_dev_details(mut self, dev_details: String) -> Self {
        self.dev_details = Some(dev_details);
        self
    }

    /// 400 Bad Request
    pub fn bad_request(
        error_code: codes::BadRequestErrorCode,
        details: Option<HashMap<String, String>>,
        dev_details: Option<String>,
    ) -> Self {
        Self {
            error: "Bad request".into(),
            error_code: error_code.to_string(),
            status_code: 400,
            details,
            dev_details,
        }
    }

    /// 401 Unauthorized
    pub fn unauthorized(
        error_code: codes::UnauthorizedErrorCode,
        dev_details: Option<String>,
    ) -> Self {
        Self {
            error: "Unauthorized".into(),
            error_code: error_code.to_string(),
            status_code: 401,
            details: None,
            dev_details,
        }
    }

    /// 403 Forbidden
    pub fn forbidden(
        error_code: codes::ForbiddenErrorCode,
        details: Option<HashMap<String, String>>,
        dev_details: Option<String>,
    ) -> Self {
        Self {
            error: "Forbidden".into(),
            error_code: error_code.to_string(),
            status_code: 403,
            details,
            dev_details,
        }
    }

    /// 404 Not Found
    pub fn not_found(
        error_code: codes::NotFoundErrorCode,
        details: Option<HashMap<String, String>>,
        dev_details: Option<String>,
    ) -> Self {
        Self {
            error: "Not found".into(),
            error_code: error_code.to_string(),
            status_code: 404,
            details,
            dev_details,
        }
    }

    /// 409 Conflict
    pub fn conflict(
        error_code: codes::ConflictErrorCode,
        details: Option<HashMap<String, String>>,
        dev_details: Option<String>,
    ) -> Self {
        Self {
            error: "Conflict".into(),
            error_code: error_code.to_string(),
            status_code: 409,
            details,
            dev_details,
        }
    }

    /// 422 Unprocessable Entity
    pub fn unprocessable_entity(
        error_code: codes::UnprocessableEntityErrorCode,
        details: Option<HashMap<String, String>>,
        dev_details: Option<String>,
    ) -> Self {
        Self {
            error: "Unprocessable entity".into(),
            error_code: error_code.to_string(),
            status_code: 422,
            details,
            dev_details,
        }
    }

    /// 500 Internal Server Error
    pub fn internal_server_error(dev_details: Option<String>) -> Self {
        Self {
            error: "Internal server error".into(),
            error_code: "internal_server_error".to_string(),
            status_code: 500,
            details: None,
            dev_details,
        }
    }
}

impl From<sqlx::Error> for ErrorResponse {
    fn from(error: sqlx::Error) -> Self {
        match error {
            sqlx::Error::RowNotFound => Self::not_found(
                codes::NotFoundErrorCode::NotFound,
                None,
                Some(error.to_string()),
            ),
            _ => Self::internal_server_error(Some(error.to_string())),
        }
    }
}
