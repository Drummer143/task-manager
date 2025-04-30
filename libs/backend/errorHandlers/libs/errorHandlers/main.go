package errorHandlers

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Error struct {
	Error      string  `json:"error"`
	ErrorCode  *string `json:"errorCode,omitempty"`
	StatusCode int     `json:"statusCode"`
	Details    *any    `json:"details,omitempty"`
}

// 304
func NotModified(ctx *gin.Context) {
	ctx.JSON(http.StatusNotModified, Error{
		Error:      "Not modified",
		StatusCode: http.StatusNotModified,
	})
}

// 400
func BadRequest(ctx *gin.Context, errorCode string, details any) {
	ctx.JSON(http.StatusBadRequest, Error{
		Error:      "Bad request",
		StatusCode: http.StatusBadRequest,
		ErrorCode:  &errorCode,
		Details:    &details,
	})
}

// 401
func Unauthorized(ctx *gin.Context, errorCode string) {
	ctx.JSON(http.StatusUnauthorized, Error{
		Error:      "Unauthorized",
		StatusCode: http.StatusUnauthorized,
		ErrorCode:  &errorCode,
	})
}

// 403
func Forbidden(ctx *gin.Context, errorCode string, details any) {
	ctx.JSON(http.StatusForbidden, Error{
		Error:      "Forbidden",
		StatusCode: http.StatusForbidden,
		ErrorCode:  &errorCode,
		Details:    &details,
	})
}

// 404
func NotFound(ctx *gin.Context, errorCode string, details any) {
	ctx.JSON(http.StatusNotFound, Error{
		Error:      "Not found",
		StatusCode: http.StatusNotFound,
		ErrorCode:  &errorCode,
		Details:    &details,
	})
}

var internalServerErrorCodeInternalServer = errorCodes.InternalServerErrorCodeInternalServer

// 500
func InternalServerError(ctx *gin.Context) {
	ctx.JSON(http.StatusInternalServerError, Error{
		Error:      "Internal server error",
		StatusCode: http.StatusInternalServerError,
		ErrorCode:  &internalServerErrorCodeInternalServer,
	})
}
