package validation

import (
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

func validateISO8601(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	layout := time.RFC3339

	if value == "" {
		return true
	}

	_, err := time.Parse(layout, value)
	return err == nil
}

var Validator *validator.Validate

func init() {
	Validator = validator.New()
	Validator.RegisterValidation("iso8601", validateISO8601)
}

func toCamelCase(str string) string {
	if len(str) == 0 {
		return str
	}
	return strings.ToLower(string(str[0])) + str[1:]
}

func ParseValidationError(err error) (errorMessages map[string]string, ok bool) {
	errors, ok := err.(validator.ValidationErrors)

	if !ok {
		return nil, false
	}

	errorMessages = make(map[string]string)

	for _, err := range errors {
		var message string

		switch err.Tag() {
		case "required":
			message = err.Field() + " is required"
		case "min":
			message = err.Field() + " must be at least " + err.Param() + " characters"
		case "max":
			message = err.Field() + " must be at most " + err.Param() + " characters"
		case "iso8601":
			message = err.Field() + " must be in ISO 8601 format"
		case "oneof":
			message = err.Field() + " must be one of " + err.Param()
		case "url":
			message = err.Field() + " must be a valid URL"
		case "email":
			message = err.Field() + " must be a valid email"
		default:
			message = err.Tag() + " validation error"
		}

		errorMessages[toCamelCase(err.Field())] = message
	}

	return errorMessages, ok
}

var UnknownError = map[string]string{"message": "invalid request"}
