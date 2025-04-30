package errorHandlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Error struct {
	Error      string `json:"error"`
	ErrorCode  string `json:"errorCode,omitempty"`
	Message    string `json:"message"`
	StatusCode int    `json:"statusCode"`
	Details    *any   `json:"details,omitempty"`
}

// 304
func NotModified(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusNotModified, Error{
		Error:      "Not modified",
		Message:    message,
		StatusCode: http.StatusNotModified,
		ErrorCode:  "not_modified",
	})
}

// 400
func BadRequest(ctx *gin.Context, message string, details any) {
	ctx.JSON(http.StatusBadRequest, Error{
		Error:      "Bad request",
		Message:    message,
		StatusCode: http.StatusBadRequest,
		ErrorCode:  "bad_request",
		Details:    &details,
	})
}

// 401
func Unauthorized(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusUnauthorized, Error{
		Error:      "Unauthorized",
		Message:    message,
		StatusCode: http.StatusUnauthorized,
		ErrorCode:  "unauthorized",
	})
}

// 403
func Forbidden(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusForbidden, Error{
		Error:      "Forbidden",
		Message:    message,
		StatusCode: http.StatusForbidden,
		ErrorCode:  "forbidden",
	})
}

// 404
func NotFound(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusNotFound, Error{
		Error:      "Not found",
		Message:    message,
		StatusCode: http.StatusNotFound,
		ErrorCode:  "not_found",
	})
}

// 500
func InternalServerError(ctx *gin.Context, message string) {
	ctx.JSON(http.StatusInternalServerError, Error{
		Error:      "Internal server error",
		Message:    message,
		StatusCode: http.StatusInternalServerError,
		ErrorCode:  "internal_server_error",
	})
}