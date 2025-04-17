package pagesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary				Get page list
// @Description			Get page list
// @Tags				Pages
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				format query string false "Format of the page list" Enum(list, tree)
// @Success				200 {object} []dbClient.Page
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to workspace"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/pages [get]
func getPageList(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspaceId := uuid.MustParse(ctx.Param("workspace_id"))
		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		var pages []dbClient.Page

		err := postgres.
			Table("pages").
			Select("pages.*, page_accesses.role AS role").
			Joins("INNER JOIN page_accesses ON page_accesses.page_id = pages.id").
			Where("pages.workspace_id = ? AND page_accesses.user_id = ?", workspaceId, userId).
			Scan(&pages).Error

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get page list")
			return
		}

		pageTree := buildPageTree(pages)

		ctx.JSON(200, pageTree)
	}
}

func buildPageTree(pages []dbClient.Page) []*dbClient.Page {
	pageMap := make(map[uuid.UUID]*dbClient.Page)
	var rootPages []*dbClient.Page

	for i := range pages {
		pageMap[pages[i].ID] = &pages[i]
	}

	for i := range pages {
		page := &pages[i]
		if page.ParentPageID != nil {
			parentPage := pageMap[*page.ParentPageID]
			parentPage.ChildPages = append(parentPage.ChildPages, page)
		} else {
			rootPages = append(rootPages, page)
		}
	}

	return rootPages
}