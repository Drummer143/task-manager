package boardsRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type updateBoardBody struct {
	Name *string `json:"name"`
}

// @Summary 		Update board by id
// @Description 	Update board by id
// @Tags 			Boards
// @Accept 			json
// @Produce 		json
// @Param 			id path string true "Board ID"
// @Param 			board body updateBoardBody true "Board object that needs to be updated"
// @Success 		200 {object} dbClient.Board
// @Failure 		400 {object} errorHandlers.Error
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		403 {object} errorHandlers.Error "No access to board"
// @Failure 		404 {object} errorHandlers.Error
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/boards/{id} [put]
func updateBoard(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		boardId, err := uuid.Parse(ctx.Param("id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid board id", nil)
			return
		}

		session := sessions.Default(ctx)

		board, boardAccess, ok := checkBoardAccess(ctx, db, boardId, session.Get("id").(uuid.UUID))

		if !ok {
			return
		}

		if boardAccess.Role == dbClient.BoardRoleGuest || boardAccess.Role == dbClient.BoardRoleComment {
			errorHandlers.Forbidden(ctx, "no access to board")
			return
		}

		var body updateBoardBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			errors, _ := validation.ParseValidationError(err)

			errorHandlers.BadRequest(ctx, "invalid request body", errors)
			return
		}

		if err := db.Model(&board).Updates(map[string]interface{}{"name": body.Name}).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update board")
		}

		ctx.JSON(200, board)
	}
}
