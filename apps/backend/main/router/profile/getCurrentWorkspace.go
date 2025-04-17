package profileRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func getUserCurrentWorkspace(ctx *gin.Context, postgres *gorm.DB) (*dbClient.Workspace, bool) {
	session := sessions.Default(ctx)

	selectedWorkspaceFromSession := session.Get("selected_workspace")
	userId := session.Get("id")

	if selectedWorkspaceFromSession == nil {
		if userId == nil {
			errorHandlers.Unauthorized(ctx, "Unauthorized")
			return nil, false
		}

		var userMeta dbClient.UserMeta

		if err := postgres.Where("user_id = ?", userId).First(&userMeta).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Internal server error")
			return nil, false
		}

		if userMeta.SelectedWorkspace == nil {
			errorHandlers.Unauthorized(ctx, "Unauthorized")
			return nil, false
		}

		selectedWorkspaceFromSession = userMeta.SelectedWorkspace
		session.Set("selected_workspace", userMeta.SelectedWorkspace)
		session.Save()
	}

	var workspace dbClient.Workspace

	if err := postgres.Where("id = ?", selectedWorkspaceFromSession).First(&workspace).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			session.Delete("selected_workspace")
			session.Save()

			postgres.Model(&dbClient.UserMeta{}).Where("user_id = ?", userId).Update("selected_workspace", nil)

			errorHandlers.NotFound(ctx, "Workspace not found")
			return nil, false
		}

		errorHandlers.InternalServerError(ctx, "Internal server error")
		return nil, false
	}

	return &workspace, true
}

// @Summary			Get current workspace
// @Description		Get current workspace
// @Tags			Profile
// @Accept			json
// @Produce			json
// @Success			200 {object} dbClient.Workspace "Workspace data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error "Workspace not found"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/profile/current-workspace [get]
func getCurrentWorkspace(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspace, ok := getUserCurrentWorkspace(ctx, postgres)

		if !ok {
			return
		}

		ctx.Set("selectedWorkspace", workspace)
	}
}
