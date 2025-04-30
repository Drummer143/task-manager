package profileRouter

import (
	"main/internal/postgres"
	"main/utils/errorCodes"
	"main/utils/errorHandlers"
	"net/http"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
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
	session := sessions.Default(ctx)

	var dbUser postgres.User

	userId := session.Get("id").(uuid.UUID)

	if err := postgres.DB.First(&dbUser, "id = ?", userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityUser)
			return
		} else {
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	includes := ctx.Query("includes")

	response := getProfileResponse{
		User:      dbUser,
		Workspace: nil,
	}

	if strings.Contains(includes, "workspace") {
		workspace, ok := getUserCurrentWorkspace(ctx)

		if !ok {
			return
		}

		response.Workspace = workspace
	}

	ctx.JSON(http.StatusOK, response)
}
