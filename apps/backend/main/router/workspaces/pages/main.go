package pagesRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	accessesRouter "main/router/workspaces/pages/accesses"
	tasksRouter "main/router/workspaces/pages/tasks"
	"main/utils/ginTools"
	"main/utils/routerUtils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func hasAccessToPageMiddleware(ctx *gin.Context) {
	pageId, err := uuid.Parse(ctx.Param("page_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"page_id"})
		return
	}

	userId := ginTools.MustGetUserIdFromSession(ctx)

	_, _, ok := routerUtils.CheckPageAccess(ctx, postgres.DB, postgres.DB, pageId, userId)

	if !ok {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityPage)
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
