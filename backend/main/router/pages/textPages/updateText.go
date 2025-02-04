package textPages

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/router/utils"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type updateTextBody struct {
	Text string `json:"text"`
}

// @Summary 		Update text page by id
// @Description 	Update text page by id
// @Tags 			Text Pages
// @Accept 			json
// @Produce 		json
// @Param 			id path string true "Page ID"
// @Param 			page body updateTextBody true "Page object that needs to be updated"
// @Success 		200 {object} dbClient.TextPageLine
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to page"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/pages/{id}/text [put]
func updateText(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid page id", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		page, pageAccess, ok := utils.CheckPageAccess(ctx, db, pageId, userId)

		if !ok {
			return
		}

		if page.Type != dbClient.PageTypeText {
			errorHandlers.BadRequest(ctx, "page is not a text page", nil)
			return
		}

		if pageAccess.Role == dbClient.PageRoleGuest || pageAccess.Role == dbClient.PageRoleCommentator {
			errorHandlers.Forbidden(ctx, "no access to page")
			return
		}

		var body updateTextBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		var textPage dbClient.TextPageLine

		if err := db.First(&textPage, "page_id = ?", pageId).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "page not found")
				return
			}
		}

		textPage.Text = body.Text

		if err := db.Save(&textPage).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to save text page")
			return
		}

		ctx.JSON(200, textPage)
	}
}
