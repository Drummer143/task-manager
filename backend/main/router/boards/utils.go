package boardsRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func checkBoardAccess(ctx *gin.Context, db *gorm.DB, boardId uuid.UUID, userId uuid.UUID) (board dbClient.Board, boardAccess dbClient.BoardAccesses, ok bool) {
	if err := db.First(&board, "id = ?", boardId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, "board not found")
			return board, boardAccess, false
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get board")
			return board, boardAccess, false
		}
	}

	if err := db.First(&boardAccess, "board_id = ? AND user_id = ?", boardId, userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.Forbidden(ctx, "board access not found")
			return board, boardAccess, false
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get board access")
			return board, boardAccess, false
		}
	}

	return board, boardAccess, true
}
