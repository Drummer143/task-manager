package pagesRouter

import (
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/errorHandlers"
	"main/utils/ginTools"
	"main/utils/routerUtils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
// @Success 		200 {object} postgres.Page
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to page or workspace or no access to update page"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/workspaces/{workspace_id}/pages/{page_id} [put]
func updatePage(ctx *gin.Context) {
	pageId, err := uuid.Parse(ctx.Param("page_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, "invalid page id", nil)
		return
	}

	userId := ginTools.MustGetUserIdFromSession(ctx)

	page, pageAccess, ok := routerUtils.CheckPageAccess(ctx, postgres.DB, postgres.DB, pageId, userId)

	if !ok {
		return
	}

	if pageAccess.Role != postgres.UserRoleGuest || pageAccess.Role != postgres.UserRoleCommentator {
		errorHandlers.Forbidden(ctx, "no access to page")
		return
	}

	var body updatePageBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, "invalid request body", nil)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		errors, _ := validation.ParseValidationError(err)

		errorHandlers.BadRequest(ctx, "invalid request body", errors)
		return
	}

	if page.Type != postgres.PageTypeText && body.Text != nil {
		errorHandlers.BadRequest(ctx, "only text pages can have text", nil)
		return
	}

	if err := postgres.DB.Model(&page).Updates(map[string]interface{}{"name": body.Name}).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "failed to update page")
	}

	ctx.JSON(200, page)
}
