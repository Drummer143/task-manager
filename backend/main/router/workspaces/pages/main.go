package pagesRouter

import (
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	accessesRouter "main/router/workspaces/pages/accesses"
	tasksRouter "main/router/workspaces/pages/tasks"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func hasAccessToPageMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("page_id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		_, _, ok := routerUtils.CheckPageAccess(ctx, db, db, pageId, userId)

		if !ok {
			errorHandlers.Forbidden(ctx, "no access to workspace")
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func AddRoutes(group *gin.RouterGroup, db *gorm.DB, validate *validator.Validate) {
	group.GET("", getPageList(db))

	group.POST("", createPage(db, validate))

	group.GET("/:page_id", getPage(db))

	group.PUT("/:page_id", updatePage(db, validate))

	group.DELETE("/:page_id", deletePage(db))

	accessesRouter.AddRoutes(group.Group("/:page_id/accesses"), db)

	tasksRouter.AddRoutes(group.Group("/:page_id/tasks", hasAccessToPageMiddleware(db)), db, validate)
}
