package accessesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/router/utils"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary				Get page accesses
// @Description 		Get page accesses
// @Tags				Page Accesses
// @Produce				json
// @Param				id path string true "Page ID"
// @Success				200 {object} []dbClient.PageAccess
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to page"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/pages/{id}/accesses [get]
func getPageAccesses(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid page id", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		_, access, ok := utils.CheckPageAccess(ctx, db, pageId, userId)

		if !ok {
			return
		}

		if access.Role != dbClient.PageRoleOwner && access.Role != dbClient.PageRoleAdmin {
			errorHandlers.Forbidden(ctx, "no access to page")
			return
		}

		var pageAccess []dbClient.PageAccess

		if err := db.Preload("User").Where("page_id = ?", pageId).Find(&pageAccess).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get page accesses")
			return
		}

		ctx.JSON(http.StatusOK, pageAccess)
	}
}
