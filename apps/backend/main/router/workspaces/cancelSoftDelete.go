package workspacesRouter

import (
	"main/internal/postgres"
	"main/utils/errorCodes"
	"main/utils/errorHandlers"
	"main/utils/ginTools"
	"main/utils/routerUtils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
func cancelSoftDeleteWorkspace(ctx *gin.Context) {
	workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"workspace_id"})
		return
	}

	userId := ginTools.MustGetUserIdFromSession(ctx)

	_, workspaceAccess, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres.DB, postgres.DB, workspaceId, userId)

	if !ok {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityWorkspace)
		return
	}

	if workspaceAccess.Role != postgres.UserRoleOwner {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeInsufficientPermissions, map[string]string{"action": errorCodes.DetailCodeActionCancelDeletion, "target": errorCodes.DetailCodeEntityWorkspace})
		return
	}

	if err := postgres.DB.Model(&postgres.Workspace{}).Where("id = ?", workspaceId).Update("deleted_at", nil).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.Status(200)
}
