package router

import (
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/utils/ginTools"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func setDefaultWorkspace(ctx *gin.Context) {
	user := ginTools.MustGetUser(ctx)

	session := sessions.Default(ctx)

	selectedWorkspaceFromSession := session.Get("selected_workspace")

	if selectedWorkspaceFromSession != nil {
		return
	}

	var userMeta postgres.UserMeta

	if err := postgres.DB.Where("user_id = ?", user.ID).First(&userMeta).Error; err != nil {
		return
	}

	if userMeta.SelectedWorkspace != nil {
		session.Set("selected_workspace", userMeta.SelectedWorkspace)
		session.Save()
		return
	}

	var workspace postgres.Workspace

	if err := postgres.DB.Joins("JOIN workspace_accesses ON workspace_accesses.workspace_id = workspaces.id").
		Where("workspace_accesses.user_id = ? AND workspace_accesses.deleted_at IS NULL", user.ID).
		First(&workspace).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	userMeta.SelectedWorkspace = &workspace.ID

	if err := postgres.DB.Save(&userMeta).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	session.Set("selected_workspace", workspace.ID)
	session.Save()
}
