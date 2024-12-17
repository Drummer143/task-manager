package pagesRouter

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

// @Summary 		Delete page by id
// @Description 	Delete page by id
// @Tags 			Pages
// @Produce 		json
// @Param 			id path string true "Page ID"
// @Success 		200 {object} dbClient.Page
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/pages/{id} [delete]
func deletePage(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid page id", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		page, pageAccess, ok :=utils.CheckPageAccess(ctx, db, pageId, userId)

		if !ok {
			return
		}

		if pageAccess.Role != dbClient.PageRoleOwner {
			errorHandlers.Forbidden(ctx, "no access to delete page")
			return
		}

		if err := db.Delete(&page).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to delete page")
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
