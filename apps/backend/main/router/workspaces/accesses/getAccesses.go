package workspacesAccessesRouter

import (
	"main/internal/postgres"
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary				Get workspace accesses
// @Description 		Get workspace accesses
// @Tags				Workspace Accesses
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Success				200 {object} []postgres.WorkspaceAccess
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to workspace or workspace or no access to get workspace accesses"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/accesses [get]
func getWorkspaceAccesses(ctx *gin.Context) {
	workspaceId := uuid.MustParse(ctx.Param("workspace_id"))

	// userId, _ := routerUtils.GetUserIdFromSession(ctx)

	// _, access, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres.DB, postgres.DB, workspaceId, userId)

	// if !ok {
	// 	return
	// }

	// if access.Role != postgres.UserRoleOwner && access.Role != postgres.UserRoleAdmin {
	// 	errorHandlers.Forbidden(ctx, "no access to workspace")
	// 	return
	// }

	var workspaceAccess []postgres.WorkspaceAccess

	if err := postgres.DB.Preload("User").Where("workspace_id = ?", workspaceId).Find(&workspaceAccess).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "failed to get workspace accesses")
		return
	}

	ctx.JSON(http.StatusOK, workspaceAccess)
}
