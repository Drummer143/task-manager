package workspacesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary				Cancel soft deletion of workspace
// @Description			Cancel soft deletion of workspace
// @Tags				Workspaces
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Success				200
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to workspace"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/cancel-soft-delete [post]
func cancelSoftDeleteWorkspace(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		_, workspaceAccess, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres, postgres, workspaceId, userId)

		if !ok {
			errorHandlers.Forbidden(ctx, "no access to workspace")
			return
		}

		if workspaceAccess.Role != dbClient.UserRoleOwner {
			errorHandlers.Forbidden(ctx, "Not enough permissions to cancel deletion of workspace")
			return
		}

		if err := postgres.Model(&dbClient.Workspace{}).Where("id = ?", workspaceId).Update("deleted_at", nil).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to cancel deletion of workspace")
			return
		}

		ctx.Status(200)
	}
}