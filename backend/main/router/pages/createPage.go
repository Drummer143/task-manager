package pagesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/router/utils"
	"main/validation"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type createPageBody struct {
	Name     string            `json:"name" validate:"required"`
	Type     dbClient.PageType `json:"type" validate:"required,oneof=text board group"`
	ParentId *uuid.UUID        `json:"parentId" validate:"omitempty,uuid4"`
}

// @Summary			Create a new page
// @Description		Create a new page
// @Tags			Pages
// @Accept			json
// @Produce			json
// @Param			page body createPageBody true "Page object that needs to be created"
// @Success			201 {object} dbClient.Page
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/pages [post]
func createPage(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body createPageBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			errors, _ := validation.ParseValidationError(err)

			errorHandlers.BadRequest(ctx, "invalid request body", errors)

			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		if body.ParentId != nil {
			parentPage, access, ok := utils.CheckPageAccess(ctx, db, *body.ParentId, userId)

			if !ok {
				return
			}

			if access.Role == dbClient.PageRoleOwner || access.Role == dbClient.PageRoleAdmin {
				errorHandlers.Forbidden(ctx, "access to parent parentPage is forbidden")
				return
			}

			if parentPage.Type == dbClient.PageTypeGroup {
				errorHandlers.BadRequest(ctx, "unable to create group page inside group page", nil)
				return
			}
		}

		var page = dbClient.Page{
			Name:     body.Name,
			Type:     body.Type,
			OwnerID:  userId,
			ParentID: body.ParentId,
			UserRole: dbClient.PageRoleOwner,
		}

		if err := db.Create(&page).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create page")
			return
		}

		var pageAccess = dbClient.PageAccess{
			Role:   dbClient.PageRoleOwner,
			PageID: page.ID,
			UserID: userId,
		}

		if err := db.Create(&pageAccess).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create page")
			return
		}

		ctx.JSON(http.StatusCreated, page)
	}
}
