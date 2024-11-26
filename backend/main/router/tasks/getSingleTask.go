package tasksRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary			Get a task
// @Description		Get a task
// @Tags			Tasks
// @Produce			json
// @Param			id path string true "Task ID"
// @Success			200 {object} dbClient.Task
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/tasks/{id} [get]
func getSingleTask(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task dbClient.Task

		if err := db.First(&task, "id = ?", ctx.Param("id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "task not found")
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get task")
			}

			return
		}

		ctx.JSON(http.StatusOK, task)
	}
}
