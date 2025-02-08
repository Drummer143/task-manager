package tasksRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type changeTaskStatusBody struct {
	Status taskStatus `json:"status" validate:"required,oneof=not_done in_progress done"`
}

// @Summary			Change task status
// @Description		Change task status
// @Tags			Tasks
// @Accept			json
// @Produce			json
// @Param			id path int true "Task ID"
// @Param			status body changeTaskStatusBody true "Task status. Must be one of: not_done, in_progress, done"
// @Success			200 {object} dbClient.Task
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/status [patch]
func changeStatus(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task dbClient.Task

		if err := db.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "task not found")
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get task")
			}
		}

		var body changeTaskStatusBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Var(body, "required,oneof=not_done in_progress done"); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid status", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		task.Status = body.Status

		if err := db.Save(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update task")
		}

		ctx.JSON(http.StatusOK, task)
	}
}
