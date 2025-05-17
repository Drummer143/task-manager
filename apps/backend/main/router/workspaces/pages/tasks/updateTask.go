package tasksRouter

import (
	"context"
	"encoding/json"
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
	"main/internal/validation"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/gorm"
)

type updateTaskBody struct {
	Status      *taskStatus                `json:"status,omitempty" validate:"omitempty,oneof=not_done in_progress done"`
	Title       *string                    `json:"title,omitempty" validate:"omitempty,max=63"`
	Description *mongoClient.EditorContent `json:"description,omitempty" validate:"omitempty"`
	DueDate     *time.Time                 `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssigneeID  *uuid.UUID                 `json:"assigneeId,omitempty" validate:"omitempty,uuid4"`
}

func ToRawMessage(v any) json.RawMessage {
	bytes, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return json.RawMessage(bytes)
}

// @Summary			Update a task
// @Description		Update a task
// @Tags			Tasks
// @Accept			json
// @Produce			json
// @Param			workspace_id path string true "Workspace ID"
// @Param			page_id path int true "Page ID"
// @Param			task_id path string true "Task ID"
// @Param			task body updateTaskBody true "Task object that needs to be updated"
// @Success			200 {object} postgres.Task
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id} [put]
func updateTask(ctx *gin.Context) {
	var task postgres.Task

	if err := postgres.DB.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityTask)
		} else {
			errorHandlers.InternalServerError(ctx)
		}

		return
	}

	var body updateTaskBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		// fmt.Println("\n\n\n", err.Error(), "\n\n\n", body.DueDate, "\n\n\n")
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
			return
		}

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	taskDescriptionCollection := mongoClient.DB.Database("task").Collection("description")

	opts := options.FindOne().SetSort(gin.H{"version": -1})

	var previousContent mongoClient.EditorContent
	var version int

	if err := taskDescriptionCollection.FindOne(context.Background(), gin.H{"pageid": task.ID}, opts).Decode(&previousContent); err != nil {
		if err == mongo.ErrNoDocuments {
			version = 1
		} else {
			errorHandlers.InternalServerError(ctx)
			return
		}
	} else {
		version = *previousContent.Version + 1
		task.Description = &previousContent
	}

	hasChanges := false

	if body.Title != nil && *body.Title != task.Title {
		hasChanges = true
		// changes["title"] = mongoClient.Change{From: task.Title, To: body.Title}
		task.Title = *body.Title
	}
	if body.Description != nil && body.Description != task.Description {
		hasChanges = true
		// changes["description"] = mongoClient.Change{From: task.Description, To: body.Description}
		task.Description = body.Description
	}
	if body.AssigneeID != nil && body.AssigneeID != task.AssigneeID {
		hasChanges = true
		// changes["assigneeId"] = mongoClient.Change{From: task.AssigneeID, To: body.AssigneeID}
		task.AssigneeID = body.AssigneeID
	}
	if body.Status != nil && *body.Status != task.Status {
		hasChanges = true
		// changes["status"] = mongoClient.Change{From: task.Status, To: body.Status}
		task.Status = *body.Status
	}
	if body.DueDate != nil && body.DueDate != task.DueDate {
		hasChanges = true
		// changes["dueDate"] = mongoClient.Change{From: task.DueDate, To: body.DueDate}
		task.DueDate = body.DueDate
	}

	if !hasChanges {
		ctx.JSON(http.StatusOK, task)
		return
	}

	// user := ginTools.MustGetUser(ctx)

	if body.Description != nil {
		body.Description.PageID = &task.ID
		body.Description.Version = &version

		task.Description = body.Description

		if _, err := taskDescriptionCollection.InsertOne(context.Background(), body.Description); err != nil {
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	// var latestChange mongoClient.EntityVersionDocument
	// opts = options.FindOne().SetSort(gin.H{"version": -1})
	// newChange := mongoClient.EntityVersionDocument{
	// 	Changes:   changes,
	// 	Id:        task.ID,
	// 	Author:    mongoClient.ShortUserInfo{Id: user.ID, Username: user.Username, Picture: user.Picture},
	// 	CreatedAt: time.Now(),
	// }

	// if err := tasksVersionCollection.FindOne(context.Background(), gin.H{"id": task.ID}, opts).Decode(&latestChange); err != nil {
	// 	if err != mongo.ErrNoDocuments {
	// 		errorHandlers.InternalServerError(ctx)
	// 		return
	// 	}

	// 	newChange.Version = 1
	// } else {
	// 	newChange.Version = latestChange.Version + 1
	// }

	// if _, err := tasksVersionCollection.InsertOne(context.Background(), newChange); err != nil {
	// 	errorHandlers.InternalServerError(ctx)
	// 	return
	// }

	if err := postgres.DB.Save(&task).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, task)
}
