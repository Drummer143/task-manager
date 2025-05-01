package profileRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type getProfileResponse struct {
	postgres.User
	Workspace *postgres.Workspace `json:"workspace,omitempty"`
}

// @Summary			Get current user profile
// @Description		This endpoint retrieves the user profile information from the Auth0 Management API using the user's ID from the session. The ID is obtained from the session and used to query the user data from the external identity provider (Auth0). The user must be authenticated, and a valid session must exist.
// @Tags			Profile
// @Accept			json
// @Produce			json
// @Param			includes query string false "Include additional user data. One of: workspace"
// @Success			200 {object} getProfileResponse "User profile data"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error "User not found in database"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/profile [get]
func getProfile(ctx *gin.Context) {
	user, ok := ctx.Get("user")

	if !ok {
		errorHandlers.Unauthorized(ctx, errorCodes.UnauthorizedErrorCodeUnauthorized)
		return
	}

	dbUser := user.(postgres.User)

	includes := ctx.Query("includes")

	response := getProfileResponse{
		User:      dbUser,
		Workspace: nil,
	}

	if strings.Contains(includes, "workspace") {
		workspace, ok := getUserCurrentWorkspace(ctx, dbUser.ID)

		if !ok {
			return
		}

		response.Workspace = workspace
	}

	ctx.JSON(http.StatusOK, response)
}
