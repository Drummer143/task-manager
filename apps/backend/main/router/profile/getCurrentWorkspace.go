package profileRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func getUserCurrentWorkspace(ctx *gin.Context, userId uuid.UUID) (*postgres.Workspace, bool) {
	session := sessions.Default(ctx)

	selectedWorkspaceFromSession := session.Get("selected_workspace")

	if selectedWorkspaceFromSession == nil {
		var userMeta postgres.UserMeta

		if err := postgres.DB.Where("user_id = ?", userId).First(&userMeta).Error; err != nil {
			errorHandlers.InternalServerError(ctx)
			return nil, false
		}

		if userMeta.SelectedWorkspace == nil {
			errorHandlers.Unauthorized(ctx, errorCodes.UnauthorizedErrorCodeUnauthorized)
			return nil, false
		}

		selectedWorkspaceFromSession = userMeta.SelectedWorkspace
		session.Set("selected_workspace", userMeta.SelectedWorkspace)
		session.Save()
	}

	var workspace postgres.Workspace

	if err := postgres.DB.Where("id = ?", selectedWorkspaceFromSession).First(&workspace).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			session.Delete("selected_workspace")
			session.Save()

			postgres.DB.Model(&postgres.UserMeta{}).Where("user_id = ?", userId).Update("selected_workspace", nil)

			errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityWorkspace)
			return nil, false
		}

		errorHandlers.InternalServerError(ctx)
		return nil, false
	}

	return &workspace, true
}

// @Summary			Get current workspace
// @Description		Get current workspace
// @Tags			Profile
// @Accept			json
// @Produce			json
// @Success			200 {object} postgres.Workspace "Workspace data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error "Workspace not found"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/profile/current-workspace [get]
func getCurrentWorkspace(ctx *gin.Context) {
	user, ok := ctx.Get("user")

	if !ok {
		errorHandlers.Unauthorized(ctx, errorCodes.UnauthorizedErrorCodeUnauthorized)
		return
	}

	dbUser := user.(postgres.User)

	workspace, ok := getUserCurrentWorkspace(ctx, dbUser.ID)

	if !ok {
		return
	}

	ctx.Set("selectedWorkspace", workspace)
}
