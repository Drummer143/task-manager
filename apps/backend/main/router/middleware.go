package router

import (
	"main/internal/postgres"
	"main/utils/auth"
	"main/utils/errorCodes"
	"main/utils/errorHandlers"
	"main/utils/ginTools"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func IsAuthenticated(ctx *gin.Context) {
	session := sessions.Default(ctx)

	token := session.Get("token")

	if token == nil {
		session.Clear()
		session.Save()

		errorHandlers.Unauthorized(ctx, errorCodes.UnauthorizedErrorCodeUnauthorized)

		ctx.Abort()

		return
	}

	if _, err := auth.ValidateJWT(token.(string)); err != nil {
		session.Clear()
		session.Save()

		errorHandlers.Unauthorized(ctx, errorCodes.UnauthorizedErrorCodeUnauthorized)

		ctx.Abort()
	} else {
		ctx.Next()
	}
}

func setDefaultWorkspace(ctx *gin.Context) {
	userId := ginTools.MustGetUserIdFromSession(ctx)

	session := sessions.Default(ctx)

	selectedWorkspaceFromSession := session.Get("selected_workspace")

	if selectedWorkspaceFromSession != nil {
		return
	}

	var userMeta postgres.UserMeta

	if err := postgres.DB.Where("user_id = ?", userId).First(&userMeta).Error; err != nil {
		return
	}

	if userMeta.SelectedWorkspace != nil {
		session.Set("selected_workspace", userMeta.SelectedWorkspace)
		session.Save()
		return
	}

	var workspace postgres.Workspace

	if err := postgres.DB.Joins("JOIN workspace_accesses ON workspace_accesses.workspace_id = workspaces.id").
		Where("workspace_accesses.user_id = ? AND workspace_accesses.deleted_at IS NULL", userId).
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
