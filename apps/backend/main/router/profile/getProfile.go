package profileRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type getProfileResponse struct {
	dbClient.User
	Workspace *dbClient.Workspace `json:"workspace,omitempty"`
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
func getProfile(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		var dbUser dbClient.User

		userId := session.Get("id").(uuid.UUID)

		if err := postgres.First(&dbUser, "id = ?", userId).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "user not found")
				return
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get user")
				return
			}
		}

		includes := ctx.Query("includes")

		response := getProfileResponse{
			User:      dbUser,
			Workspace: nil,
		}

		if strings.Contains(includes, "workspace") {
			workspace, ok := getUserCurrentWorkspace(ctx, postgres)

			if !ok {
				return
			}

			response.Workspace = workspace
		}

		ctx.JSON(http.StatusOK, response)
	}
}
