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

/// Types
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TypeMap {
    Integer,
}

impl std::fmt::Display for TypeMap {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TypeMap::Integer => write!(f, "integer"),
        }
    }
}

impl TypeMap {
    pub fn from_str(s: &str) -> Result<Self, &'static str> {
        match s {
            "integer" | "int" | "digit" | "number" => Ok(TypeMap::Integer),
            _ => Err("Invalid type"),
        }
    }
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

impl std::fmt::Display for UnauthorizedErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UnauthorizedErrorCode::Unauthorized => write!(f, "unauthorized"),
        }
    }
}

/// Forbidden Errors
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

/// Not Found Errors
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
