package workspacesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary			Get workspace list
// @Description		Get workspace list
// @Tags			Workspaces
// @Produce			json
// @Param			include query string false "Comma separated list of fields to include. Available fields: pages, owner"
// @Success			200 {object} []dbClient.Workspace
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces [get]
func getWorkspaceList(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		var workspaces []dbClient.Workspace

		include := ctx.Query("include")

		if strings.Contains(include, "pages") {
			postgres.Preload("Pages")
		}
		if strings.Contains(include, "owner") {
			postgres.Preload("Owner")
		}

		err := postgres.
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
}
