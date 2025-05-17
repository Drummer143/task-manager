use serde::{Deserialize, Serialize};

/// Bad Request Error Codes
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BadRequestErrorCode {
    InvalidBody,
    ValidationErrors,
    UnsupportedField,
    InvalidToken,
    InvalidCredentials,
    EmailTaken,
    InvalidParams,
    InvalidQueryParams,
    NestedPage,
    IncludeParamConflictOneOf,
}

impl std::fmt::Display for BadRequestErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BadRequestErrorCode::InvalidBody => write!(f, "invalid_body"),
            BadRequestErrorCode::ValidationErrors => write!(f, "validation_errors"),
            BadRequestErrorCode::UnsupportedField => write!(f, "unsupported_field"),
            BadRequestErrorCode::InvalidToken => write!(f, "invalid_token"),
            BadRequestErrorCode::InvalidCredentials => write!(f, "invalid_credentials"),
            BadRequestErrorCode::EmailTaken => write!(f, "email_taken"),
            BadRequestErrorCode::InvalidParams => write!(f, "invalid_params"),
            BadRequestErrorCode::InvalidQueryParams => write!(f, "invalid_query_params"),
            BadRequestErrorCode::NestedPage => write!(f, "nested_page"),
            BadRequestErrorCode::IncludeParamConflictOneOf => {
                write!(f, "include_param_conflict_one_of")
            }
        }
    }
}

/// Field Error Codes
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FieldErrorCode {
    MissingField,
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

/// File Error Codes
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FileErrorCode {
    MissingFile,
    InvalidFileType,
    FileTooLarge,
    FileTooSmall,
    InvalidFileFormat,
    FileUploadFailed,
    UnsupportedFileType,
    FileCorrupted,
    FileNotReadable,
}

/// Unauthorized Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UnauthorizedErrorCode {
    Unauthorized,
}

/// Forbidden Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ForbiddenErrorCode {
    AccessDenied,
    InsufficientPermissions,
}

/// Not Found Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NotFoundErrorCode {
    NotFound,
}

/// Internal Server Errors
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InternalServerErrorCode {
    InternalServerError,
}

/// Detail Codes for Entity
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DetailCodeEntity {
    User,
    Workspace,
    Page,
    Task,
    ParentPage,
}

/// Detail Codes for Actions
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DetailCodeAction {
    CancelDeletion,
    Delete,
    ChangeAccess,
}
