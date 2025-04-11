package workspacesRouter

import (
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	workspacesAccessesRouter "main/router/workspaces/accesses"
	pagesRouter "main/router/workspaces/pages"
	"main/socketManager"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

func hasAccessToWorkspaceMiddleware(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		_, _, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres, postgres, workspaceId, userId)

		if !ok {
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

func AddRoutes(group *gin.RouterGroup, postgres *gorm.DB, mongo *mongo.Client, validate *validator.Validate, sockets *socketManager.SocketManager) {
	group.POST("", createWorkspace(postgres, validate))

	group.GET("", getWorkspaceList(postgres))

	group.GET("/:workspace_id", getWorkspace(postgres))

	group.PUT("/:workspace_id", updateWorkspace(postgres, validate))
	group.POST("/:workspace_id/cancel-soft-delete", cancelSoftDeleteWorkspace(postgres))

	group.DELETE("/:workspace_id/soft-delete", softDeleteWorkspace(postgres))

	workspacesAccessesRouter.AddRoutes(group.Group("/:workspace_id/accesses"), postgres)

	pagesRouter.AddRoutes(group.Group("/:workspace_id/pages", hasAccessToWorkspaceMiddleware(postgres)), postgres, mongo, validate, sockets)
}
