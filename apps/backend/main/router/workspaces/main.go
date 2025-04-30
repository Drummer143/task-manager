package workspacesRouter

import (
	"main/internal/postgres"
	workspacesAccessesRouter "main/router/workspaces/accesses"
	pagesRouter "main/router/workspaces/pages"
	"main/utils/errorHandlers"
	"main/utils/routerUtils"
	"main/utils/sessionTools"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func hasAccessToWorkspaceMiddleware(ctx *gin.Context) {
	workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
		return
	}

	userId := sessionTools.MustGetUserIdFromSession(ctx)

	_, _, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres.DB, postgres.DB, workspaceId, userId)

	if !ok {
		ctx.Abort()
		return
	}

	ctx.Next()
}

func AddRoutes(group *gin.RouterGroup) {
	group.POST("", createWorkspace)

	group.GET("", getWorkspaceList)
	group.GET("/:workspace_id", getWorkspace)

	group.PUT("/:workspace_id", updateWorkspace)

	group.POST("/:workspace_id/cancel-soft-delete", cancelSoftDeleteWorkspace)

	group.DELETE("/:workspace_id/soft-delete", softDeleteWorkspace)

	workspacesAccessesRouter.AddRoutes(group.Group("/:workspace_id/accesses"))

	pagesRouter.AddRoutes(group.Group("/:workspace_id/pages", hasAccessToWorkspaceMiddleware))
}
