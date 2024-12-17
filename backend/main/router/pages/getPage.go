package pagesRouter

import (
	"main/router/errorHandlers"
	"main/router/utils"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary 		Get page by id
// @Description 	Get page by id
// @Tags 			Pages
// @Produce 		json
// @Param 			id path string true "Page ID"
// @Param			include query string false "Comma separated list of fields to include. Available fields: tasks"
// @Success 		200 {object} dbClient.Page
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to page"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/pages/{id} [get]
func getPage(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid page id", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		page, access, ok :=utils.CheckPageAccess(ctx, db, pageId, userId)

		if !ok {
			return
		}

		page.UserRole = access.Role

		ctx.JSON(http.StatusOK, page)
	}
}
