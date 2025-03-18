package pagesRouter

import (
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	accessesRouter "main/router/workspaces/pages/accesses"
	tasksRouter "main/router/workspaces/pages/tasks"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

func hasAccessToPageMiddleware(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("page_id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		_, _, ok := routerUtils.CheckPageAccess(ctx, postgres, postgres, pageId, userId)

		if !ok {
			errorHandlers.Forbidden(ctx, "no access to workspace")
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func AddRoutes(group *gin.RouterGroup, postgres *gorm.DB, mongo *mongo.Client, validate *validator.Validate) {
	group.GET("", getPageList(postgres))

	group.POST("", createPage(postgres, validate))

	group.GET("/:page_id", getPage(postgres))

	group.PUT("/:page_id", updatePage(postgres, validate))

	group.DELETE("/:page_id", deletePage(postgres))

	accessesRouter.AddRoutes(group.Group("/:page_id/accesses"), postgres)

	tasksRouter.AddRoutes(group.Group("/:page_id/tasks", hasAccessToPageMiddleware(postgres)), postgres, mongo, validate)
}
