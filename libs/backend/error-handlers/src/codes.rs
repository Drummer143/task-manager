use serde::{Deserialize, Serialize};

/// 400 Bad Request Error Codes
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BadRequestErrorCode {
    InvalidBody,
    InvalidParams,
    InvalidQueryParams,
}

impl std::fmt::Display for BadRequestErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BadRequestErrorCode::InvalidBody => write!(f, "invalid_body"),
            BadRequestErrorCode::InvalidParams => write!(f, "invalid_params"),
            BadRequestErrorCode::InvalidQueryParams => write!(f, "invalid_query_params"),
        }
    }
}

/// 401 Unauthorized Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UnauthorizedErrorCode {
    Unauthorized,
    InvalidToken,
    InvalidCredentials,
}

impl std::fmt::Display for UnauthorizedErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UnauthorizedErrorCode::Unauthorized => write!(f, "unauthorized"),
            UnauthorizedErrorCode::InvalidToken => write!(f, "invalid_token"),
            UnauthorizedErrorCode::InvalidCredentials => write!(f, "invalid_credentials"),
        }
    }
}

/// 403 Forbidden Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ForbiddenErrorCode {
    AccessDenied,
    InsufficientPermissions,
}

impl std::fmt::Display for ForbiddenErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ForbiddenErrorCode::AccessDenied => write!(f, "access_denied"),
            ForbiddenErrorCode::InsufficientPermissions => write!(f, "insufficient_permissions"),
        }
    }
}

/// 404 Not Found Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotFoundErrorCode {
    NotFound,
}

impl std::fmt::Display for NotFoundErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NotFoundErrorCode::NotFound => write!(f, "not_found"),
        }
    }
}

/// 409 Conflict Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConflictErrorCode {
    EmailTaken,
    AccessAlreadyGiven,
}

impl std::fmt::Display for ConflictErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConflictErrorCode::EmailTaken => write!(f, "email_taken"),
            ConflictErrorCode::AccessAlreadyGiven => write!(f, "access_already_given"),
        }
    }
}

/// 422 Unprocessable Entity Error Codes
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UnprocessableEntityErrorCode {
    ValidationErrors,
}

impl std::fmt::Display for UnprocessableEntityErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UnprocessableEntityErrorCode::ValidationErrors => write!(f, "validation_errors"),
        }
    }
}

/// 422 Field Error Codes
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FieldErrorCode {
    MissingField,
    InvalidType,
    InvalidFormat,
    FieldTooShort,
    FieldTooLong,
    FieldOutOfRange,
    InvalidEnumValue,
    FieldRequired,
    FieldNotAllowed,
    FieldMismatch,
    InvalidEmail,
    InvalidPhone,
    InvalidDate,
}

impl std::fmt::Display for FieldErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FieldErrorCode::MissingField => write!(f, "missing_field"),
            FieldErrorCode::InvalidType => write!(f, "invalid_type"),
            FieldErrorCode::InvalidFormat => write!(f, "invalid_format"),
            FieldErrorCode::FieldTooShort => write!(f, "field_too_short"),
            FieldErrorCode::FieldTooLong => write!(f, "field_too_long"),
            FieldErrorCode::FieldOutOfRange => write!(f, "field_out_of_range"),
            FieldErrorCode::InvalidEnumValue => write!(f, "invalid_enum_value"),
            FieldErrorCode::FieldRequired => write!(f, "field_required"),
            FieldErrorCode::FieldNotAllowed => write!(f, "field_not_allowed"),
            FieldErrorCode::FieldMismatch => write!(f, "field_mismatch"),
            FieldErrorCode::InvalidEmail => write!(f, "invalid_email"),
            FieldErrorCode::InvalidPhone => write!(f, "invalid_phone"),
            FieldErrorCode::InvalidDate => write!(f, "invalid_date"),
        }
    }
}

/// 500 Internal Server Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InternalServerErrorCode {
    InternalServerError,
}
