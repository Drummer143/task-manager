package workspacesRouter

import (
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary				Get workspace
// @Description			Get workspace
// @Tags				Workspaces
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				include query string false "Comma separated list of fields to include. Available fields: pages, owner"
// @Success				200 {object} dbClient.Workspace
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to workspace"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id} [get]
func getWorkspace(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		include := ctx.Query("include")

		dbWithIncludes := postgres

		if strings.Contains(include, "pages") {
			dbWithIncludes.Preload("Pages")
		}

		if strings.Contains(include, "owner") {
			dbWithIncludes.Preload("Owner")
		}

		workspace, _, ok := routerUtils.CheckWorkspaceAccess(ctx, dbWithIncludes, postgres, workspaceId, userId)

		if !ok {
			return
		}

		ctx.JSON(200, workspace)
	}
}
