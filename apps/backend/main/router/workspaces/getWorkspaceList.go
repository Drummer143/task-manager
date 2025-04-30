package workspacesRouter

import (
	"main/internal/postgres"
	"main/utils/errorHandlers"
	"main/utils/ginTools"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary			Get workspace list
// @Description		Get workspace list
// @Tags			Workspaces
// @Produce			json
// @Param			include query string false "Comma separated list of fields to include. Available fields: pages, owner"
// @Success			200 {object} []postgres.Workspace
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces [get]
func getWorkspaceList(ctx *gin.Context) {
	userId := ginTools.MustGetUserIdFromSession(ctx)

	var workspaces []postgres.Workspace

	include := ctx.Query("include")

	if strings.Contains(include, "pages") {
		postgres.DB.Preload("Pages")
	}
	if strings.Contains(include, "owner") {
		postgres.DB.Preload("Owner")
	}

	err := postgres.DB.
		Table("workspaces").
		Select("workspaces.*, workspace_accesses.role AS role").
		Joins("INNER JOIN workspace_accesses ON workspace_accesses.workspace_id = workspaces.id").
		Where("workspace_accesses.user_id = ?", userId).
		Scan(&workspaces).Error

	if err != nil {
		errorHandlers.InternalServerError(ctx, "failed to get workspace list")
		return
	}

	ctx.JSON(http.StatusOK, workspaces)
}
