package boardsRouter

import (
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary 		Get board by id
// @Description 	Get board by id
// @Tags 			Boards
// @Produce 		json
// @Param 			id path string true "Board ID"
// @Success 		200 {object} dbClient.Board
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to board"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 		/boards/{id} [get]
func getBoard(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		boardId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid board id", nil)
			return
		}

		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		board, access, ok := checkBoardAccess(ctx, db, boardId, userId)

		board.UserRole = access.Role

		if !ok {
			return
		}

		ctx.JSON(http.StatusOK, board)
	}
}
