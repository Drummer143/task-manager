package pagesRouter

import (
	"context"
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
	"main/utils/ginTools"
	"main/utils/routerUtils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// @Summary 		Get page by id
// @Description 	Get page by id
// @Tags 			Pages
// @Produce 		json
// @Param 			workspace_id path string true "Workspace ID"
// @Param 			page_id path string true "Page ID"
// @Param 			include query string false "Comma separated list of fields to include. Available fields: parentPage, childPages, owner, tasks"
// @Success 		200 {object} postgres.Page
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to page or workspace"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/workspaces/{workspace_id}/pages/{page_id} [get]
func getPage(ctx *gin.Context) {
	pageId, err := uuid.Parse(ctx.Param("page_id"))

	if err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"page_id"})
		return
	}

	user := ginTools.MustGetUser(ctx)

	include := ctx.Query("include")

	if strings.Contains(include, "parentPage") && strings.Contains(include, "childPages") {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorIncludeParamConflictOneOf, []string{"parentPage", "childPages"})
		return
	}

	dbWithIncludes := postgres.DB

	if strings.Contains(include, "parentPage") {
		dbWithIncludes = dbWithIncludes.Preload("ParentPage")
	}

	if strings.Contains(include, "childPages") {
		dbWithIncludes = dbWithIncludes.Preload("ChildPages")
	}

	if strings.Contains(include, "owner") {
		dbWithIncludes = dbWithIncludes.Preload("Owner")
	}

	if strings.Contains(include, "tasks") {
		dbWithIncludes = dbWithIncludes.Preload("Tasks")
	}

	page, access, ok := routerUtils.CheckPageAccess(ctx, dbWithIncludes, postgres.DB, pageId, user.ID)

	if page.Type == postgres.PageTypeText {
		textPageContentCollection := mongoClient.DB.Database("page").Collection("edit_content")

		var content mongoClient.EditorContent

		options := options.FindOne().SetSort(gin.H{"version": -1})

		if err := textPageContentCollection.FindOne(context.Background(), gin.H{"pageid": page.ID}, options).Decode(&content); err != nil {
			if err != mongo.ErrNoDocuments {
				errorHandlers.InternalServerError(ctx)
				return
			}
		} else {
			page.Text = &content
		}
	}

	if !ok {
		return
	}

	page.Role = &access.Role

	ctx.JSON(http.StatusOK, page)
}
