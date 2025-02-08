package workspacesRouter

import (
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	pagesRouter "main/router/workspaces/pages"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func hasAccessToWorkspaceMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		_, _, ok := routerUtils.CheckWorkspaceAccess(ctx, db, db, workspaceId, userId)

		if !ok {
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func AddRoutes(group *gin.RouterGroup, db *gorm.DB, validate *validator.Validate) {
	group.POST("", createWorkspace(db, validate))

	group.GET("", getWorkspaceList(db))

	group.GET("/:workspace_id", getWorkspace(db))

	pagesRouter.AddRoutes(group.Group("/:workspace_id/pages", hasAccessToWorkspaceMiddleware(db)), db, validate)
}
