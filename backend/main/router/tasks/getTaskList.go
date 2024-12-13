package tasksRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary			Get a list of tasks
// @Description		Get a list of tasks created by user with the given ID. If no ID is provided, the ID of the currently logged in user is used
// @Tags			Tasks
// @Produce			json
// @Param			owner_id query string false "ID of the user who created the tasks"
// @Success			200 {object} groupedByStatusTasks
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/tasks [get]
func getTaskList(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		boardId := ctx.Query("board_id")

		if boardId == "" {
			errorHandlers.BadRequest(ctx, "board_id is required", nil)
			return
		}

		var tasks []dbClient.Task

		include := ctx.Query("include")

		if strings.Contains(include, "assignee") {
			db.Preload("Assignee")
		}

		if strings.Contains(include, "author") {
			db.Preload("Author")
		}

		if err := db.Find(&tasks, "board_id = ?", boardId).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get tasks")
			return
		}

		var tasksGroups = make(groupedByStatusTasks)

		for _, task := range tasks {
			tasksGroups[task.Status] = append(tasksGroups[task.Status], task)
		}

		ctx.JSON(http.StatusOK, tasksGroups)
	}
}
