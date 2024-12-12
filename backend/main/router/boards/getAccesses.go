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

// @Summary				Get board accesses
// @Description 		Get board accesses
// @Tags				Boards
// @Produce				json
// @Param				id path string true "Board ID"
// @Success				200 {object} []dbClient.BoardAccesses
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to board"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/boards/{id}/accesses [get]
func getBoardAccesses(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		boardId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid board id", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		_, access, ok := checkBoardAccess(ctx, db, boardId, userId)

		if !ok {
			return
		}

		if access.Role != dbClient.BoardRoleOwner && access.Role != dbClient.BoardRoleAdmin {
			errorHandlers.Forbidden(ctx, "no access to board")
			return
		}

		var boardAccesses []dbClient.BoardAccesses

		if err := db.Preload("User").Where("board_id = ?", boardId).Find(&boardAccesses).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get board accesses")
			return
		}

		ctx.JSON(http.StatusOK, boardAccesses)
	}
}
