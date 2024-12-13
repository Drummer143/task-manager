package boardsRouter

import (
	"fmt"
	"main/dbClient"
	"main/router/errorHandlers"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary 		Get board list
// @Description 	Get list of boards user has access to
// @Tags 			Boards
// @Produce 		json
// @Param 			include query string false "Include tasks in response"
// @Success 		200 {array} dbClient.Board
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		500 {object} errorHandlers.Error
// @Router 		/boards [get]
func getBoardList(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		include := ctx.Query("include")

		fmt.Println(include, strings.Contains(include, "tasks"))

		query := db.Joins("JOIN board_accesses ON board_accesses.board_id = boards.id").Where("board_accesses.user_id = ?", userId)

		if strings.Contains(include, "tasks") {
			query = query.Preload("Tasks")
		}

		if strings.Contains(include, "owner") {
			query = query.Preload("Owner")
		}

		if strings.Contains(include, "access") {
			query = query.Preload("BoardAccesses")
		}

		var boards []dbClient.Board

		if err := query.Find(&boards).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get board list")
			return
		}

		if strings.Contains(include, "access") {
			for i := range boards {
				for _, access := range *boards[i].BoardAccesses {
					if access.UserID == userId {
						boards[i].UserRole = access.Role
						break
					}
				}
			}
		} else {
			for i := range boards {
				_, access, _ := checkBoardAccess(ctx, db, boards[i].ID, userId)

				boards[i].UserRole = access.Role
			}
		}

		ctx.JSON(200, boards)
	}
}
