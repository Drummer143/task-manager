package accessesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/router/utils"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type giveAccessBody = struct {
	UserId uuid.UUID          `json:"userId" validate:"required,uuid4"`
	Role   *dbClient.PageRole `json:"role" validate:"oneof=owner admin member commentator guest"`
}

// @Summary 		Change access to page
// @Description 	Changes access to page. Can change access if it was already given, give if it wasn't or remove it, if no role was given in pair
// @Tags 			Page Accesses
// @Accept 			json
// @Produce 		json
// @Param 			id path string true "Page ID"
// @Param 			page body giveAccessBody true "Page object that needs to be updated"
// @Success 		200 {string} string "Success"
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to page"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/pages/{id}/accesses [put]
func updateAccess(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid page id", nil)
			return
		}

		var body giveAccessBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		session := sessions.Default(ctx)

		currentUserId := session.Get("id").(uuid.UUID)

		_, pageAccess, ok := utils.CheckPageAccess(ctx, db, pageId, currentUserId)
		currentUserRole := pageAccess.Role

		if !ok {
			return
		}

		if currentUserRole != dbClient.PageRoleOwner && currentUserRole != dbClient.PageRoleAdmin {
			errorHandlers.Forbidden(ctx, "no allowed to change access to page")
			return
		}

		// the only owner can't be removed
		if currentUserRole == dbClient.PageRoleOwner && currentUserId == body.UserId && (body.Role == nil || *body.Role != dbClient.PageRoleOwner) {
			var nonCurrentUserOwner dbClient.PageAccess

			if err := db.First(&nonCurrentUserOwner, "page_id = ? AND role = ? and user_id <> ?", pageId, dbClient.PageRoleOwner, currentUserId).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					errorHandlers.Forbidden(ctx, "not allowed to remove the only owner of the page. Set another owner first")
					return
				} else {
					errorHandlers.InternalServerError(ctx, "failed to check access to the page")
					return
				}
			}
		}

		// admin can't give/remove admin or owner access to page
		if currentUserRole == dbClient.PageRoleAdmin {
			if body.Role != nil && (*body.Role == dbClient.PageRoleOwner || *body.Role == dbClient.PageRoleAdmin) {
				errorHandlers.Forbidden(ctx, "admin can't give admin or owner access to page")
				return
			}

			if currentUserId != body.UserId {
				var entryUserAccess dbClient.PageAccess

				if err := db.First(&entryUserAccess, "page_id = ? AND user_id = ?", pageId, body.UserId).Error; err != nil {
					errorHandlers.InternalServerError(ctx, "failed to get page access")
					return
				}

				if entryUserAccess.Role == dbClient.PageRoleOwner || entryUserAccess.Role == dbClient.PageRoleAdmin {
					errorHandlers.Forbidden(ctx, "admin can't remove admins or owners from the page")
					return
				}
			}
		}

		if body.Role == nil {
			if err := db.Where("page_id = ? AND user_id = ?", pageId, body.UserId).Delete(&dbClient.PageAccess{}).Error; err != nil {
				errorHandlers.InternalServerError(ctx, "failed to delete page access")
				return
			}
		} else {
			var bodyUserAccess dbClient.PageAccess

			if body.UserId == currentUserId {
				bodyUserAccess = pageAccess
			} else if err := db.First(&bodyUserAccess, "page_id = ? AND user_id = ?", pageId, body.UserId).Error; err != nil {
				if err != gorm.ErrRecordNotFound {
					errorHandlers.InternalServerError(ctx, "failed to get page access")
					return
				}
			}

			if err := db.Model(&bodyUserAccess).Update("role", *body.Role).Error; err != nil {
				errorHandlers.InternalServerError(ctx, "failed to update page access")
				return
			}
		}

		ctx.String(200, "Success")
	}
}
