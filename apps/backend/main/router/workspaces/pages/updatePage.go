package pagesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"main/validation"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type updatePageBody struct {
	Name *string `json:"name"`
	Text *string `json:"text"`
}

// @Summary 		Update page by id
// @Description 	Update page by id
// @Tags 			Pages
// @Accept 			json
// @Produce 		json
// @Param 			workspace_id path string true "Workspace ID"
// @Param 			page_id path string true "Page ID"
// @Param 			page body updatePageBody true "Page object that needs to be updated"
// @Success 		200 {object} dbClient.Page
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to page or workspace or no access to update page"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/workspaces/{workspace_id}/pages/{page_id} [put]
func updatePage(postgres *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid page id", nil)
			return
		}

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		page, pageAccess, ok := routerUtils.CheckPageAccess(ctx, postgres, postgres, pageId, userId)

		if !ok {
			return
		}

		if pageAccess.Role == dbClient.UserRoleGuest || pageAccess.Role == dbClient.UserRoleCommentator {
			errorHandlers.Forbidden(ctx, "no access to page")
			return
		}

		var body updatePageBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			errors, _ := validation.ParseValidationError(err)

			errorHandlers.BadRequest(ctx, "invalid request body", errors)
			return
		}

		if page.Type != dbClient.PageTypeText && body.Text != nil {
			errorHandlers.BadRequest(ctx, "only text pages can have text", nil)
			return
		}

		if err := postgres.Model(&page).Updates(map[string]interface{}{"name": body.Name}).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update page")
		}

		ctx.JSON(200, page)
	}
}
