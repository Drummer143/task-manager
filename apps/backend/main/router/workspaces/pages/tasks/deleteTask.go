package tasksRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary			Delete a task
// @Description		Delete a task
// @Tags			Tasks
// @Produce			json
// @Param			workspace_id path string true "Workspace ID"
// @Param			page_id path int true "Page ID"
// @Param			task_id path string true "Task ID"
// @Success			200 {object} postgres.Task
// @Failure			401 {object} errorHandlers.Error
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id} [delete]
func deleteTask(ctx *gin.Context) {
	var task postgres.Task

	if err := postgres.DB.First(&task, "id = ?", ctx.Param("task_id")); err.Error != nil {
		if err.Error == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityTask)
		} else {
			errorHandlers.InternalServerError(ctx)
		}

		return
	}

	if err := postgres.DB.Delete(&task).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, task)
}
