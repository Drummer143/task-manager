package accessesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary				Get page accesses
// @Description 		Get page accesses
// @Tags				Page Accesses
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				page_id path string true "Page ID"
// @Success				200 {object} []dbClient.PageAccess
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to page or workspace or no access to get page accesses"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/pages/{page_id}/accesses [get]
func getPageAccesses(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId := uuid.MustParse(ctx.Param("page_id"))

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		_, access, ok := routerUtils.CheckPageAccess(ctx, postgres, postgres, pageId, userId)

		if !ok {
			return
		}

		if access.Role != dbClient.UserRoleOwner && access.Role != dbClient.UserRoleAdmin {
			errorHandlers.Forbidden(ctx, "no access to page")
			return
		}

		var pageAccess []dbClient.PageAccess

		if err := postgres.Preload("User").Where("page_id = ?", pageId).Find(&pageAccess).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get page accesses")
			return
		}

		ctx.JSON(http.StatusOK, pageAccess)
	}
}
