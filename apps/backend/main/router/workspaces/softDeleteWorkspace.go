package workspacesRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/utils/ginTools"
	"main/utils/routerUtils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary				Soft delete workspace
// @Description			Soft delete workspace
// @Tags				Workspaces
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Success				204
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to workspace or no access to delete workspace"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/soft-delete [delete]
func softDeleteWorkspace(ctx *gin.Context) {
	workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"workspace_id"})
		return
	}

	user := ginTools.MustGetUser(ctx)

	_, workspaceAccess, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres.DB, postgres.DB, workspaceId, user.ID)

	if !ok {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityWorkspace)
		return
	}

	if workspaceAccess.Role != postgres.UserRoleOwner {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeInsufficientPermissions, map[string]string{"action": errorCodes.DetailCodeActionDelete, "target": errorCodes.DetailCodeEntityWorkspace})
		return
	}

	today := time.Now()
	deletionTime := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.UTC)

	deletionTime = deletionTime.AddDate(0, 0, 14)

	if err := postgres.DB.Model(&postgres.Workspace{}).Where("id = ?", workspaceId).Update("deleted_at", &deletionTime).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.Status(http.StatusNoContent)
}
