package workspacesRouter

import (
	"main/internal/postgres"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
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
		errorHandlers.BadRequest(ctx, "invalid workspace id", nil)
		return
	}

	userId, _ := routerUtils.GetUserIdFromSession(ctx)

	_, workspaceAccess, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres.DB, postgres.DB, workspaceId, userId)

	if !ok {
		errorHandlers.Forbidden(ctx, "no access to workspace")
		return
	}

	if workspaceAccess.Role != postgres.UserRoleOwner {
		errorHandlers.Forbidden(ctx, "no access to delete workspace")
		return
	}

	today := time.Now()
	deletionTime := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.UTC)

	deletionTime = deletionTime.AddDate(0, 0, 14)

	if err := postgres.DB.Model(&postgres.Workspace{}).Where("id = ?", workspaceId).Update("deleted_at", &deletionTime).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "failed to delete workspace")
		return
	}

	ctx.Status(http.StatusNoContent)
}
