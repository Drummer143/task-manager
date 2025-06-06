package workspacesRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/utils/ginTools"
	"main/utils/routerUtils"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// @Summary				Get workspace
// @Description			Get workspace
// @Tags				Workspaces
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				include query string false "Comma separated list of fields to include. Available fields: pages, owner"
// @Success				200 {object} postgres.Workspace
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to workspace"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id} [get]
func getWorkspace(ctx *gin.Context) {
	workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"workspace_id"})
		return
	}

	user := ginTools.MustGetUser(ctx)

	include := ctx.Query("include")

	dbWithIncludes := postgres.DB

	for _, param := range strings.Split(include, ",") {
		switch param {
		case "pages":
			dbWithIncludes = dbWithIncludes.Preload("Pages")
		case "owner":
			dbWithIncludes = dbWithIncludes.Preload("Owner")
		}
	}

	workspace, _, ok := routerUtils.CheckWorkspaceAccess(ctx, dbWithIncludes, postgres.DB, workspaceId, user.ID)

	if !ok {
		return
	}

	ctx.JSON(200, workspace)
}
