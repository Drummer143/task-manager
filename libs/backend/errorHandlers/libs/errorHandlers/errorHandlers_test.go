package errorHandlers_test

import (
	"encoding/json"
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestNotModified(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()

	router.GET("/test-endpoint", errorHandlers.NotModified)

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(t, err)

	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusNotModified, resp.Code)

	contentType := resp.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=utf-8", contentType)
}

func TestBadRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()

	errorCode := "VALIDATION_ERROR"
	details := map[string]string{
		"field":   "username",
		"message": "Username is required",
	}

	router.GET("/test-endpoint", func(c *gin.Context) {
		errorHandlers.BadRequest(c, errorCode, details)
	})

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(t, err)

	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusBadRequest, resp.Code)

	contentType := resp.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=utf-8", contentType)

	var responseBody errorHandlers.Error
	err = json.Unmarshal(resp.Body.Bytes(), &responseBody)
	assert.NoError(t, err)

	assert.Equal(t, "Bad request", responseBody.Error)
	assert.Equal(t, http.StatusBadRequest, responseBody.StatusCode)

	assert.NotNil(t, responseBody.ErrorCode)
	assert.Equal(t, errorCode, *responseBody.ErrorCode)

	assert.NotNil(t, responseBody.Details)

	detailsValue := *responseBody.Details

	detailsMap, ok := detailsValue.(map[string]interface{})
	assert.True(t, ok, "Details должен быть преобразован в map")

	assert.Equal(t, "username", detailsMap["field"])
	assert.Equal(t, "Username is required", detailsMap["message"])
}

func TestUnauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()

	errorCode := "INVALID_TOKEN"

	router.GET("/test-endpoint", func(c *gin.Context) {
		errorHandlers.Unauthorized(c, errorCode)
	})

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(t, err)

	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusUnauthorized, resp.Code)

	contentType := resp.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=utf-8", contentType)

	var responseBody errorHandlers.Error
	err = json.Unmarshal(resp.Body.Bytes(), &responseBody)
	assert.NoError(t, err)

	assert.Equal(t, "Unauthorized", responseBody.Error)
	assert.Equal(t, http.StatusUnauthorized, responseBody.StatusCode)

	assert.NotNil(t, responseBody.ErrorCode)
	assert.Equal(t, errorCode, *responseBody.ErrorCode)

	assert.Nil(t, responseBody.Details)
}

func TestForbidden(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()

	errorCode := "ACCESS_DENIED"
	details := map[string]string{
		"resource": "user_profile",
		"reason":   "Insufficient permissions",
	}

	router.GET("/test-endpoint", func(c *gin.Context) {
		errorHandlers.Forbidden(c, errorCode, details)
	})

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(t, err)

	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusForbidden, resp.Code)

	contentType := resp.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=utf-8", contentType)

	var responseBody errorHandlers.Error
	err = json.Unmarshal(resp.Body.Bytes(), &responseBody)
	assert.NoError(t, err)

	assert.Equal(t, "Forbidden", responseBody.Error)
	assert.Equal(t, http.StatusForbidden, responseBody.StatusCode)

	assert.NotNil(t, responseBody.ErrorCode)
	assert.Equal(t, errorCode, *responseBody.ErrorCode)

	assert.NotNil(t, responseBody.Details)

	detailsValue := *responseBody.Details

	detailsMap, ok := detailsValue.(map[string]interface{})
	assert.True(t, ok, "Details должен быть преобразован в map")

	assert.Equal(t, "user_profile", detailsMap["resource"])
	assert.Equal(t, "Insufficient permissions", detailsMap["reason"])
}

func TestNotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()

	errorCode := "RESOURCE_NOT_FOUND"
	details := map[string]interface{}{
		"resource_type": "task",
		"resource_id":   12345,
	}

	router.GET("/test-endpoint", func(c *gin.Context) {
		errorHandlers.NotFound(c, errorCode, details)
	})

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(t, err)

	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusNotFound, resp.Code)

	contentType := resp.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=utf-8", contentType)

	var responseBody errorHandlers.Error
	err = json.Unmarshal(resp.Body.Bytes(), &responseBody)
	assert.NoError(t, err)

	assert.Equal(t, "Not found", responseBody.Error)
	assert.Equal(t, http.StatusNotFound, responseBody.StatusCode)

	assert.NotNil(t, responseBody.ErrorCode)
	assert.Equal(t, errorCode, *responseBody.ErrorCode)

	assert.NotNil(t, responseBody.Details)

	detailsValue := *responseBody.Details

	detailsMap, ok := detailsValue.(map[string]interface{})
	assert.True(t, ok, "Details должен быть преобразован в map")

	assert.Equal(t, "task", detailsMap["resource_type"])
}

func TestInternalServerError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()

	router.GET("/test-endpoint", func(c *gin.Context) {
		errorHandlers.InternalServerError(c)
	})

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(t, err)

	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusInternalServerError, resp.Code)

	contentType := resp.Header().Get("Content-Type")
	assert.Equal(t, "application/json; charset=utf-8", contentType)

	var responseBody errorHandlers.Error
	err = json.Unmarshal(resp.Body.Bytes(), &responseBody)
	assert.NoError(t, err)

	assert.Equal(t, "Internal server error", responseBody.Error)
	assert.Equal(t, http.StatusInternalServerError, responseBody.StatusCode)

	assert.NotNil(t, responseBody.ErrorCode)
	assert.Equal(t, errorCodes.InternalServerErrorCodeInternalServer, *responseBody.ErrorCode)

	assert.Nil(t, responseBody.Details)
}
