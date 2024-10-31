package tasksRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary			Delete a task
// @Description		Delete a task
// @Tags			Tasks
// @Produce			json
// @Param			id path string true "Task ID"
// @Success			200 {object} dbClient.Task
// @Failure			401 {object} errorHandlers.Error
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/tasks/{id} [delete]
func deleteTask(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		profile, _ := session.Get("profile").(map[string]interface{})

		var task dbClient.Task

		if err := db.First(&task, "id = ?", ctx.Param("id")); err.Error != nil {
			if err.Error == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "task not found")
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get task")
			}

			return
		}

		if task.OwnerID != profile["sub"].(string) {
			errorHandlers.Forbidden(ctx, "owner of task forbade deletion. Only the owner and admin can delete tasks.")
			return
		}

		if err := db.Delete(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to delete task")
			return
		}

		ctx.JSON(http.StatusOK, task)
	}
}
