package pagesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"main/validation"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type createPageBody struct {
	Title    string            `json:"title" validate:"required"`
	Type     dbClient.PageType `json:"type" validate:"required,oneof=text board group"`
	ParentId *uuid.UUID        `json:"parentId" validate:"omitempty,uuid4"`
	Text     *string           `json:"text"`
}

// @Summary			Create a new page
// @Description		Create a new page
// @Tags			Pages
// @Accept			json
// @Produce			json
// @Param			workspace_id path string true "Workspace ID"
// @Param			page body createPageBody true "Page object that needs to be created"
// @Success			201 {object} dbClient.Page
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			403 {object} errorHandlers.Error "No access to workspace or no access to create page"
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages [post]
func createPage(postgres *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body createPageBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			errors, _ := validation.ParseValidationError(err)

			errorHandlers.BadRequest(ctx, "invalid request body", errors)

			return
		}

		if body.Type == dbClient.PageTypeGroup && body.ParentId != nil {
			errorHandlers.BadRequest(ctx, "unable to create group page inside group page", nil)
			return
		}

		if body.Type != dbClient.PageTypeText && body.Text != nil {
			errorHandlers.BadRequest(ctx, "text field is required for non-text pages", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		if body.ParentId != nil {
			_, access, ok := routerUtils.CheckPageAccess(ctx, postgres, postgres, *body.ParentId, userId)

			if !ok {
				return
			}

			if access.Role != dbClient.UserRoleOwner && access.Role != dbClient.UserRoleAdmin {
				errorHandlers.Forbidden(ctx, "access to parent parentPage is forbidden")
				return
			}

			if body.Type == dbClient.PageTypeGroup {
				errorHandlers.BadRequest(ctx, "unable to create group page inside group page", nil)
				return
			}
		}

		var page = dbClient.Page{
			Title:        body.Title,
			Type:         body.Type,
			WorkspaceID:  uuid.MustParse(ctx.Param("workspace_id")),
			OwnerID:      userId,
			ParentPageID: body.ParentId,
			Text:         body.Text,
		}

		tx := postgres.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
				errorHandlers.InternalServerError(ctx, "internal server error")
				return
			}
		}()

		if err := tx.Create(&page).Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to create page")
			return
		}

		pageAccess := dbClient.PageAccess{
			Role:   dbClient.UserRoleOwner,
			PageID: page.ID,
			UserID: userId,
		}

		if err := tx.Create(&pageAccess).Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to create page access")
			return
		}

		if err := routerUtils.GiveAccessToWorkspaceAdmins(tx, page.ID, page.WorkspaceID); err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to give workspace admins access to page")
			return
		}

		if body.ParentId != nil {
			if err := routerUtils.GiveAccessToParentPageAdmins(tx, *body.ParentId, page.WorkspaceID); err != nil {
				tx.Rollback()
				errorHandlers.InternalServerError(ctx, "failed to give parent page admins access")
				return
			}
		}

		if err := tx.Commit().Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to commit transaction")
			return
		}

		ctx.JSON(http.StatusCreated, page)
	}
}