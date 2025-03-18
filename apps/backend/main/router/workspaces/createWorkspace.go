package workspacesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
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
// @Success			201 {object} dbClient.Workspace
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces [post]
func createWorkspace(postgres *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body createWorkspaceBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request body", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		workspace := dbClient.Workspace{
			Name:    body.Name,
			OwnerID: userId,
		}

		if err := postgres.Create(&workspace).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create workspace")
			return
		}

		workspaceAccess := dbClient.WorkspaceAccess{
			WorkspaceID: workspace.ID,
			UserID:      userId,
			Role:        dbClient.UserRoleOwner,
		}

		if err := postgres.Create(&workspaceAccess).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create workspace access")
			return
		}

		workspace.Role = &workspaceAccess.Role

		ctx.JSON(201, workspace)
	}
}
