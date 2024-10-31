package errorHandlers

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
)

type Error struct {
	Error      string `json:"error"`
	ErrorCode  string `json:"errorCode,omitempty"`
	Message    string `json:"message"`
	StatusCode int    `json:"statusCode"`
	Details    *any   `json:"details,omitempty"`
}

func HandleAuth0Error(ctx *gin.Context, strError string) {
	var jsonError Error

	err := json.Unmarshal([]byte(strError), &jsonError)

	if err != nil {
		InternalServerError(ctx, "Request to Auth0 failed")
	} else {
		ctx.JSON(jsonError.StatusCode, jsonError)
	}
}
