package errorCodes

const (
	BadRequestErrorCodeInvalidBody           = "invalid_body"
	BadRequestErrorCodeValidationErrors      = "validation_errors"
	BadRequestErrorCodeUnsupportedField      = "unsupported_field"
	BadRequestErrorCodeInvalidToken          = "invalid_token"
	BadRequestErrorCodeInvalidCredentials    = "invalid_credentials"
	BadRequestErrorCodeEmailTaken            = "email_taken"
	BadRequestErrorCodeInvalidParams         = "invalid_params"
	BadRequestErrorCodeInvalidQueryParams    = "invalid_query_params"
	BadRequestErrorNestedPage                = "nested_page"
	BadRequestErrorIncludeParamConflictOneOf = "include_param_conflict_one_of"
)

const (
	FieldErrorMissingField     = "missing_field"
	FieldErrorInvalidFormat    = "invalid_format"
	FieldErrorFieldTooShort    = "field_too_short"
	FieldErrorFieldTooLong     = "field_too_long"
	FieldErrorFieldOutOfRange  = "field_out_of_range"
	FieldErrorInvalidEnumValue = "invalid_enum_value"
	FieldErrorFieldRequired    = "field_required"
	FieldErrorFieldNotAllowed  = "field_not_allowed"
	FieldErrorFieldMismatch    = "field_mismatch"
	FieldErrorInvalidEmail     = "invalid_email"
	FieldErrorInvalidPhone     = "invalid_phone"
	FieldErrorInvalidDate      = "invalid_date"
)

const (
	FileErrorMissingFile         = "missing_file"
	FileErrorInvalidFileType     = "invalid_file_type"
	FileErrorFileTooLarge        = "file_too_large"
	FileErrorFileTooSmall        = "file_too_small"
	FileErrorInvalidFileFormat   = "invalid_file_format"
	FileErrorFileUploadFailed    = "file_upload_failed"
	FileErrorUnsupportedFileType = "unsupported_file_type"
	FileErrorFileCorrupted       = "file_corrupted"
	FileErrorFileNotReadable     = "file_not_readable"
)

const (
	UnauthorizedErrorCodeUnauthorized = "unauthorized"
)

const (
	ForbiddenErrorCodeAccessDenied            = "access_denied"
	ForbiddenErrorCodeInsufficientPermissions = "insufficient_permissions"
)

const (
	NotFoundErrorCodeNotFound = "not_found"
)

const (
	InternalServerErrorCodeInternalServer = "internal_server_error"
)

const (
	DetailCodeEntityUser       = "user"
	DetailCodeEntityWorkspace  = "workspace"
	DetailCodeEntityPage       = "page"
	DetailCodeEntityTask       = "task"
	DetailCodeEntityParentPage = "parent_page"
)

const (
	DetailCodeActionCancelDeletion = "cancel_deletion"
	DetailCodeActionDelete         = "delete"
	DetailCodeActionChangeAccess   = "change_access"
)
