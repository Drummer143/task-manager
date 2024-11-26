package tasksRouter

import (
	"encoding/json"
	"main/dbClient"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// type updateTaskBody struct {
// 	DeletableNotByOwner *bool      `json:"deletableNotByOwner,omitempty" validate:"omitempty"`
// 	Status              *string    `json:"status,omitempty" validate:"omitempty,oneof=not_done in_progress done"`
// 	Title               *string    `json:"title,omitempty" validate:"omitempty,max=63"`
// 	Description         *string    `json:"description,omitempty" validate:"omitempty,max=255"`
// 	DueDate             *string    `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
// 	AssignedTo          *uuid.UUID `json:"assignedTo,omitempty" validate:"omitempty,uuid4"`
// }

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
// func updateTask(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
// 	return func(ctx *gin.Context) {
// 		var task dbClient.Task

// 		taskID := ctx.Param("id")

// 		if err := db.First(&task, "id = ?", taskID).Error; err != nil {
// 			if err == gorm.ErrRecordNotFound {
// 				errorHandlers.NotFound(ctx, "task not found")
// 			} else {
// 				errorHandlers.InternalServerError(ctx, "failed to get task")
// 			}

// 			return
// 		}

// 		var body updateTaskBody

// 		if err := ctx.BindJSON(&body); err != nil {
// 			errorHandlers.BadRequest(ctx, "invalid request body", nil)
// 			return
// 		}

// 		if err := validate.Struct(body); err != nil {
// 			if errors, ok := validation.ParseValidationError(err); ok {
// 				errorHandlers.BadRequest(ctx, "invalid request body", errors)
// 				return
// 			}

// 			errorHandlers.BadRequest(ctx, "invalid request body", nil)
// 			return
// 		}

// 		task.Title = *body.Title
// 		task.Description = body.Description
// 		task.AssignedTo = body.AssignedTo
// 		task.Status = *body.Status
// 		task.DeletableNotByOwner = *body.DeletableNotByOwner
// 		task.DueDate = body.DueDate

// 		if err := db.Save(&task).Error; err != nil {
// 			errorHandlers.InternalServerError(ctx, "failed to update task")
// 			return
// 		}

// 		ctx.JSON(http.StatusOK, task)
// 	}
// }

type updateTaskBody struct {
	Id                  uuid.UUID  `json:"id" validate:"required,uuid4"`
	DeletableNotByOwner *bool      `json:"deletableNotByOwner,omitempty" validate:"omitempty"`
	Status              *string    `json:"status,omitempty" validate:"omitempty,oneof=not_done in_progress done"`
	Title               *string    `json:"title,omitempty" validate:"omitempty,max=63"`
	Description         *string    `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate             *string    `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssignedTo          *uuid.UUID `json:"assignedTo,omitempty" validate:"omitempty,uuid4"`
}

func updateTaskWS(db *gorm.DB, validate *validator.Validate, body json.RawMessage, conn *websocket.Conn) error {
	var task updateTaskBody

	if err := json.Unmarshal(body, &task); err != nil {
		return err
	}

	if err := validate.Struct(task); err != nil {
		return err
	}

	var updates = make(map[string]interface{})

	if task.DeletableNotByOwner != nil {
		updates["deletable_not_by_owner"] = task.DeletableNotByOwner
	}

	if task.Status != nil {
		updates["status"] = task.Status
	}

	if task.Title != nil {
		updates["title"] = task.Title
	}

	if task.Description != nil {
		updates["description"] = task.Description
	}

	if task.DueDate != nil {
		updates["due_date"] = task.DueDate
	}

	if task.AssignedTo != nil {
		updates["assigned_to"] = task.AssignedTo
	}

	updates["updated_at"] = time.Now()

	if err := db.Model(&dbClient.Task{}).Where("id = ?", task.Id).Updates(updates).Error; err != nil {
		return err
	}

	if err := emit(task.Id.String(), updates, conn); err != nil {
		return err
	}

	return nil
}
