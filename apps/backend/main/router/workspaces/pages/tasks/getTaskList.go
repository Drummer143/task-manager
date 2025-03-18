package tasksRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type groupedByStatusTasks = map[taskStatus][]dbClient.Task

// @Summary			Get a list of tasks
// @Description		Get a list of tasks created by user with the given ID. If no ID is provided, the ID of the currently logged in user is used
// @Tags			Tasks
// @Produce			json
// @Param			owner_id query string false "ID of the user who created the tasks"
// @Success			200 {object} groupedByStatusTasks
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks [get]
func getTaskList(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var tasks []dbClient.Task

		include := ctx.Query("include")

		if strings.Contains(include, "assignee") {
			postgres.Preload("Assignee")
		}

		if strings.Contains(include, "author") {
			postgres.Preload("Author")
		}

		if err := postgres.Find(&tasks, "page_id = ?", ctx.Query("page_id")).Error; err != nil {
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
