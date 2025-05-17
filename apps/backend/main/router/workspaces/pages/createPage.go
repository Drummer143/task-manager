package pagesRouter

import (
	"context"
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/mongo"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/ginTools"
	"main/utils/routerUtils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type createPageBody struct {
	Title    string               `json:"title" validate:"required"`
	Type     postgres.PageType    `json:"type" validate:"required,oneof=text board group"`
	ParentId *uuid.UUID           `json:"parentId" validate:"omitempty,uuid4"`
	Text     *mongo.EditorContent `json:"text"`
}

// @Summary			Create a new page
// @Description		Create a new page
// @Tags			Pages
// @Accept			json
// @Produce			json
// @Param			workspace_id path string true "Workspace ID"
// @Param			page body createPageBody true "Page object that needs to be created"
// @Success			201 {object} postgres.Page
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			403 {object} errorHandlers.Error "No access to workspace or no access to create page"
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages [post]
func createPage(ctx *gin.Context) {
	var body createPageBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		errors, _ := validation.ParseValidationError(err)

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)

		return
	}

	if body.Type != postgres.PageTypeText && body.Text != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, map[string]string{"text": errorCodes.FieldErrorMissingField})
		return
	}

	user := ginTools.MustGetUser(ctx)

	if body.ParentId != nil {
		_, access, ok := routerUtils.CheckPageAccess(ctx, postgres.DB, postgres.DB, *body.ParentId, user.ID)

		if !ok {
			return
		}

		if access.Role != postgres.UserRoleOwner && access.Role != postgres.UserRoleAdmin {
			errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityParentPage)
			return
		}

		if body.Type == postgres.PageTypeGroup {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorNestedPage, nil)
			return
		}
	}

	var page = postgres.Page{
		Title:        body.Title,
		Type:         body.Type,
		WorkspaceID:  uuid.MustParse(ctx.Param("workspace_id")),
		OwnerID:      user.ID,
		ParentPageID: body.ParentId,
	}

	tx := postgres.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}
	}()

	if err := tx.Create(&page).Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	pageAccess := postgres.PageAccess{
		Role:   postgres.UserRoleOwner,
		PageID: page.ID,
		UserID: user.ID,
	}

	if err := tx.Create(&pageAccess).Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	if err := routerUtils.GiveAccessToWorkspaceAdmins(tx, page.ID, page.WorkspaceID); err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	if body.ParentId != nil {
		if err := routerUtils.GiveAccessToParentPageAdmins(tx, *body.ParentId, page.WorkspaceID); err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	textPageContentCollection := mongo.DB.Database("page").Collection("edit_content")

	if body.Type == postgres.PageTypeText && body.Text != nil {
		body.Text.PageID = &page.ID
		version := 1
		body.Text.Version = &version

		if _, err := textPageContentCollection.InsertOne(context.Background(), body.Text); err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(http.StatusCreated, page)
}
