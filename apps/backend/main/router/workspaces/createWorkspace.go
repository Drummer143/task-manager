package workspacesRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/ginTools"

	"github.com/gin-gonic/gin"
)

type createWorkspaceBody struct {
	Name string `json:"name" validate:"required"`
}

// @Summary			Create a new workspace
// @Description		Create a new workspace
// @Tags			Workspaces
// @Accept			json
// @Produce			json
// @Param			workspace body createWorkspaceBody true "Workspace object that needs to be created"
// @Success			201 {object} postgres.Workspace
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces [post]
func createWorkspace(ctx *gin.Context) {
	var body createWorkspaceBody

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

	user := ginTools.MustGetUser(ctx)

	workspace := postgres.Workspace{
		Name:    body.Name,
		OwnerID: user.ID,
	}

	if err := postgres.DB.Create(&workspace).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	workspaceAccess := postgres.WorkspaceAccess{
		WorkspaceID: workspace.ID,
		UserID:      user.ID,
		Role:        postgres.UserRoleOwner,
	}

	if err := postgres.DB.Create(&workspaceAccess).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	workspace.Role = &workspaceAccess.Role

	ctx.JSON(201, workspace)
}
