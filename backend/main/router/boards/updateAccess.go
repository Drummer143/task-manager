package boardsRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type giveAccessBody = struct {
	UserId uuid.UUID               `json:"userId" validate:"required,uuid4"`
	Role   *dbClient.BoardUserRole `json:"role" validate:"oneof=owner admin member commentator guest"`
}

// @Summary 		Change access to board
// @Description 	Changes access to board. Can change access if it was already given, give if it wasn't or remove it, if no role was given in pair
// @Tags 			Boards
// @Accept 			json
// @Produce 		json
// @Param 			id path string true "Board ID"
// @Param 			board body giveAccessBody true "Board object that needs to be updated"
// @Success 		200 {string} string "Success"
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to board"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/boards/{id}/access [post]
func updateAccess(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		boardId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid board id", nil)
			return
		}

		var body giveAccessBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		session := sessions.Default(ctx)

		currentUserId := session.Get("id").(uuid.UUID)

		_, boardAccess, ok := checkBoardAccess(ctx, db, boardId, currentUserId)
		currentUserRole := boardAccess.Role

		if !ok {
			return
		}

		if currentUserRole != dbClient.BoardRoleOwner && currentUserRole != dbClient.BoardRoleAdmin {
			errorHandlers.Forbidden(ctx, "no allowed to change access to board")
			return
		}

		// the only owner can't be removed
		if currentUserRole == dbClient.BoardRoleOwner && currentUserId == body.UserId && (body.Role == nil || *body.Role != dbClient.BoardRoleOwner) {
			var nonCurrentUserOwner dbClient.BoardAccesses

			if err := db.First(&nonCurrentUserOwner, "board_id = ? AND role = ? and user_id <> ?", boardId, dbClient.BoardRoleOwner, currentUserId).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					errorHandlers.Forbidden(ctx, "not allowed to remove the only owner of the board. Set another owner first")
					return
				} else {
					errorHandlers.InternalServerError(ctx, "failed to check access to the board")
					return
				}
			}
		}

		// admin can't give/remove admin or owner access to board
		if currentUserRole == dbClient.BoardRoleAdmin {
			if body.Role != nil && (*body.Role == dbClient.BoardRoleOwner || *body.Role == dbClient.BoardRoleAdmin) {
				errorHandlers.Forbidden(ctx, "admin can't give admin or owner access to board")
				return
			}

			if currentUserId != body.UserId {
				var entryUserAccess dbClient.BoardAccesses

				if err := db.First(&entryUserAccess, "board_id = ? AND user_id = ?", boardId, body.UserId).Error; err != nil {
					errorHandlers.InternalServerError(ctx, "failed to get board access")
					return
				}

				if entryUserAccess.Role == dbClient.BoardRoleOwner || entryUserAccess.Role == dbClient.BoardRoleAdmin {
					errorHandlers.Forbidden(ctx, "admin can't remove admins or owners from the board")
					return
				}
			}
		}

		if body.Role == nil {
			if err := db.Where("board_id = ? AND user_id = ?", boardId, body.UserId).Delete(&dbClient.BoardAccesses{}).Error; err != nil {
				errorHandlers.InternalServerError(ctx, "failed to delete board access")
				return
			}
		} else {
			var bodyUserAccess dbClient.BoardAccesses

			if body.UserId == currentUserId {
				bodyUserAccess = boardAccess
			} else if err := db.First(&bodyUserAccess, "board_id = ? AND user_id = ?", boardId, body.UserId).Error; err != nil {
				if err != gorm.ErrRecordNotFound {
					errorHandlers.InternalServerError(ctx, "failed to get board access")
					return
				}
			}

			if err := db.Model(&bodyUserAccess).Update("role", *body.Role).Error; err != nil {
				errorHandlers.InternalServerError(ctx, "failed to update board access")
				return
			}
		}

		ctx.String(200, "Success")
	}
}
