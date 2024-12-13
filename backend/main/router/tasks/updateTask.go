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

// @Summary			Update a task
// @Description		Update a task
// @Tags			Tasks
// @Accept			json
// @Produce			json
// @Param			id path string true "Task ID"
// @Param			task body updateTaskBody true "Task object that needs to be updated"
// @Success			200 {object} dbClient.Task
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/tasks/{id} [put]
func updateTask(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task dbClient.Task

		taskID := ctx.Param("id")

		if err := db.First(&task, "id = ?", taskID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "task not found")
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get task")
			}

			return
		}

		var body updateTaskBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request body", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if body.Title != nil {
			task.Title = *body.Title
		}
		if body.Description != nil {
			task.Description = body.Description
		}
		if body.AssignedTo != nil {
			task.AssignedTo = body.AssignedTo
		}
		if body.Status != nil {
			task.Status = *body.Status
		}
		if body.DeletableNotByOwner != nil {
			task.DeletableNotByOwner = *body.DeletableNotByOwner
		}
		if body.DueDate != nil {
			task.DueDate = body.DueDate
		}

		if err := db.Save(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update task")
			return
		}

		ctx.JSON(http.StatusOK, task)
	}
}
