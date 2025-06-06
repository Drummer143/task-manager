package workspacesRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/ginTools"
	"main/utils/routerUtils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type updateWorkspaceBody struct {
	Name string `json:"name"`
}

// @Summary 			Update workspace by id
// @Description 		Update workspace by id
// @Tags 				Workspaces
// @Accept 				json
// @Produce 			json
// @Param 				workspace_id path string true "Workspace ID"
// @Param 				workspace body updateWorkspaceBody true "Workspace object that needs to be updated"
// @Success 			200 {object} postgres.Workspace
// @Failure 			400 {object} errorHandlers.Error
// @Failure 			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 			403 {object} errorHandlers.Error "No access to workspace or no access to update workspace"
// @Failure 			404 {object} errorHandlers.Error
// @Failure 			500 {object} errorHandlers.Error
// @Router 				/workspaces/{workspace_id} [put]
func updateWorkspace(ctx *gin.Context) {
	workspaceId, err := uuid.Parse(ctx.Param("workspace_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"workspace_id"})
		return
	}

	user := ginTools.MustGetUser(ctx)

	workspace, workspaceAccess, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres.DB, postgres.DB, workspaceId, user.ID)

	if !ok {
		return
	}

	if workspaceAccess.Role != postgres.UserRoleAdmin && workspaceAccess.Role != postgres.UserRoleOwner {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityWorkspace)
		return
	}

	var body updateWorkspaceBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
			return
		}

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	if body.Name == "" {
		ctx.Status(http.StatusNoContent)
		return
	}

	workspace.Name = body.Name
	workspace.UpdatedAt = time.Now()

	if err := postgres.DB.Save(&workspace).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(200, workspace)
}
