package boardsRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary 		Delete board by id
// @Description 	Delete board by id
// @Tags 			Boards
// @Produce 		json
// @Param 			id path string true "Board ID"
// @Success 		200 {object} dbClient.Board
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/boards/{id} [delete]
func deleteBoard(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		boardId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid board id", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		board, boardAccess, ok := checkBoardAccess(ctx, db, boardId, userId)

		if !ok {
			return
		}

		if boardAccess.Role != dbClient.BoardRoleOwner && boardAccess.Role != dbClient.BoardRoleAdmin {
			errorHandlers.Forbidden(ctx, "no access to delete board")
			return
		}

		if err := db.Delete(&board).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to delete board")
			return
		}

		ctx.Status(http.StatusOK)
	}
}
