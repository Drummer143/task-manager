package tasksRouter

import (
	"context"
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/ginTools"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type createTaskBody struct {
	Status      taskStatus                 `json:"status" validate:"required"`
	Title       string                     `json:"title" validate:"required,max=63"`
	Description *mongoClient.EditorContent `json:"description,omitempty" validate:"omitempty"`
	DueDate     *string                    `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssigneeID  *uuid.UUID                 `json:"assigneeID,omitempty" validate:"omitempty,uuid4"`
}

// CreateTask 		creates a new task
// @Summary 		Create a new task
// @Description		Create a new task
// @Tags			Tasks
// @Accept 			json
// @Produce 		json
// @Param			workspace_id path string true "Workspace ID"
// @Param			page_id path int true "Page ID"
// @Param 			task body createTaskBody true "Task object that needs to be created"
// @Success 		201 {object} postgres.Task
// @Failure 		400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/workspaces/{workspace_id}/pages/{page_id}/tasks [post]
func createTask(ctx *gin.Context) {
	var body createTaskBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
			return
		}

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	user := ginTools.MustGetUser(ctx)

	var task postgres.Task = postgres.Task{
		Status:      body.Status,
		Title:       body.Title,
		Description: body.Description,
		AssigneeID:  body.AssigneeID,
		PageID:      uuid.MustParse(ctx.Param("page_id")),
		ReporterID:  user.ID,
	}

	if body.DueDate != nil {
		time, err := time.Parse(time.RFC3339, *body.DueDate)

		if err == nil {
			task.DueDate = &time
		}
	}

	tx := postgres.DB.Begin()

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			err := tx.Rollback()
			if err != nil {
				errorHandlers.InternalServerError(ctx)
			}
		}
	}()

	if err := tx.Create(&task).Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	if body.Description != nil {
		taskDescriptionCollection := mongoClient.DB.Database("task").Collection("description")

		body.Description.PageID = &task.ID
		version := 1
		body.Description.Version = &version

		if _, err := taskDescriptionCollection.InsertOne(context.Background(), body.Description); err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(http.StatusCreated, task)
}
