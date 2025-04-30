package pagesRouter

import (
	"main/internal/postgres"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	accessesRouter "main/router/workspaces/pages/accesses"
	tasksRouter "main/router/workspaces/pages/tasks"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func hasAccessToPageMiddleware(ctx *gin.Context) {
	pageId, err := uuid.Parse(ctx.Param("page_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
		return
	}

	userId, _ := routerUtils.GetUserIdFromSession(ctx)

	_, _, ok := routerUtils.CheckPageAccess(ctx, postgres.DB, postgres.DB, pageId, userId)

	if !ok {
		errorHandlers.Forbidden(ctx, "no access to workspace")
		ctx.Abort()
		return
	}

	ctx.Next()
}

func AddRoutes(group *gin.RouterGroup) {
	group.GET("", getPageList)

	group.POST("", createPage)

	group.GET("/:page_id", getPage)

	group.PUT("/:page_id", updatePage)

	group.DELETE("/:page_id", deletePage)

	accessesRouter.AddRoutes(group.Group("/:page_id/accesses"))

	tasksRouter.AddRoutes(group.Group("/:page_id/tasks", hasAccessToPageMiddleware))
}
