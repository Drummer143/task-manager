package boardsRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type createBoardBody struct {
	Name string `json:"name" validate:"required"`
}

// @Summary			Create a new board
// @Description		Create a new board
// @Tags			Boards
// @Accept			json
// @Produce			json
// @Param			board body createBoardBody true "Board object that needs to be created"
// @Success			201 {object} dbClient.Board
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/boards [post]
func createBoard(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body createBoardBody

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

		var board = dbClient.Board{
			Name:    body.Name,
			OwnerID: userId,
		}

		if err := db.Create(&board).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create board")
			return
		}

		var boardAccess = dbClient.BoardAccesses{
			BoardID: board.ID,
			UserID:  userId,
			Role:    dbClient.BoardRoleOwner,
		}

		if err := db.Create(&boardAccess).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create board access")
			return
		}

		ctx.JSON(http.StatusCreated, board)
	}
}
