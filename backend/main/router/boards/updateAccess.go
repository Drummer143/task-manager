package boardsRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type giveAccessBody = []struct {
	UserId uuid.UUID               `json:"user_id" validate:"required,uuid4"`
	Role   *dbClient.BoardUserRole `json:"role" validate:"oneof=owner admin member commentator guest"`
}

// @Summary 		Change access to board
// @Description 	Changes access to board. Can change access if it was already given, give if it wasn't or remove it
// @Tags 			Boards
// @Accept 			json
// @Produce 		json
// @Param 			id path string true "Board ID"
// @Param 			board body giveAccessBody true "Board object that needs to be updated"
// @Success 		204
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
			errorHandlers.Forbidden(ctx, "no access to give access to board")
			return
		}

		for _, entry := range body {
			// change role for yourself(also works for owner try to change their role)
			if entry.UserId == currentUserId {
				errorHandlers.BadRequest(ctx, "can't change role for yourself", nil)
				return
			}

			// admin can't give admin or owner access to board
			if currentUserRole == dbClient.BoardRoleAdmin && (*entry.Role == dbClient.BoardRoleOwner || *entry.Role == dbClient.BoardRoleAdmin) {
				errorHandlers.Forbidden(ctx, "admin can't give admin or owner access to board")
				return
			}

			var boardAccess dbClient.BoardAccesses

			if err := db.First(&boardAccess, "board_id = ? AND user_id = ?", boardId, entry.UserId).Error; err != nil {
				if err != gorm.ErrRecordNotFound {
					errorHandlers.InternalServerError(ctx, "failed to get board access")
					return
				}

				if err := db.Create(&dbClient.BoardAccesses{BoardID: boardId, UserID: entry.UserId, Role: *entry.Role}).Error; err != nil {
					errorHandlers.InternalServerError(ctx, "failed to create board access")
					return
				}

				continue
			}

			// admin can't revoke admin or owner access to board
			if currentUserRole == dbClient.BoardRoleAdmin && (boardAccess.Role == dbClient.BoardRoleOwner || boardAccess.Role == dbClient.BoardRoleAdmin) {
				errorHandlers.Forbidden(ctx, "admin can't revoke admin or owner access to board")
				return
			}

			if err := db.Model(&boardAccess).Update("role", entry.Role).Error; err != nil {
				errorHandlers.InternalServerError(ctx, "failed to update board access")
				return
			}
		}

		ctx.Status(204)
	}
}
