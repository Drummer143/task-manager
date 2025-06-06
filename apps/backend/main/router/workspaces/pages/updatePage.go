package pagesRouter

import (
	"context"
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/ginTools"
	"main/utils/routerUtils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type updatePageBody struct {
	Name *string                    `json:"name"`
	Text *mongoClient.EditorContent `json:"text"`
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
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"page_id"})
		return
	}

	user := ginTools.MustGetUser(ctx)

	page, pageAccess, ok := routerUtils.CheckPageAccess(ctx, postgres.DB, postgres.DB, pageId, user.ID)

	if !ok {
		return
	}

	if pageAccess.Role == postgres.UserRoleGuest || pageAccess.Role == postgres.UserRoleCommentator {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityPage)
		return
	}

	var body updatePageBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		errors, _ := validation.ParseValidationError(err)

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
		return
	}

	if page.Type != postgres.PageTypeText && body.Text != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, map[string]string{"text": errorCodes.FieldErrorFieldNotAllowed})
		return
	}

	tx := postgres.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}
	}()

	if body.Name != nil {
		if err := tx.Model(&page).Updates(map[string]interface{}{"title": body.Name}).Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	if body.Text != nil {
		textPageContentCollection := mongoClient.DB.Database("page").Collection("edit_content")

		var previousContent mongoClient.EditorContent
		var version int

		options := options.FindOne().SetSort(gin.H{"version": -1})

		if err := textPageContentCollection.FindOne(context.Background(), gin.H{"pageid": page.ID}, options).Decode(&previousContent); err != nil {
			if err == mongo.ErrNoDocuments {
				version = 1
			} else {
				tx.Rollback()
				errorHandlers.InternalServerError(ctx)
				return
			}
		} else {
			version = *previousContent.Version + 1
		}

		body.Text.PageID = &page.ID
		body.Text.Version = &version

		if _, err := textPageContentCollection.InsertOne(context.Background(), body.Text); err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}

		page.Text = body.Text
	}

	if err := tx.Commit().Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(200, page)
}
