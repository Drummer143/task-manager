package tasksRouter

import (
	"context"
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"main/validation"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/gorm"
)

type updateTaskBody struct {
	Status      *taskStatus `json:"status,omitempty" validate:"omitempty,oneof=not_done in_progress done"`
	Title       *string     `json:"title,omitempty" validate:"omitempty,max=63"`
	Description *string     `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate     *time.Time  `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssigneeID  *uuid.UUID  `json:"assigneeId,omitempty" validate:"omitempty,uuid4"`
}

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
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id} [put]
func updateTask(postgres *gorm.DB, tasksVersionCollection *mongo.Collection, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task dbClient.Task

		if err := postgres.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
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

		var changes = make(map[string]dbClient.Change)

		if body.Title != nil && *body.Title != task.Title {
			changes["title"] = dbClient.Change{From: task.Title, To: body.Title}
			task.Title = *body.Title
		}
		if body.Description != nil && body.Description != task.Description {
			changes["description"] = dbClient.Change{From: task.Description, To: body.Description}
			task.Description = body.Description
		}
		if body.AssigneeID != nil && body.AssigneeID != task.AssigneeID {
			changes["assigneeId"] = dbClient.Change{From: task.AssigneeID, To: body.AssigneeID}
			task.AssigneeID = body.AssigneeID
		}
		if body.Status != nil && *body.Status != task.Status {
			changes["status"] = dbClient.Change{From: task.Status, To: body.Status}
			task.Status = *body.Status
		}
		if body.DueDate != nil && body.DueDate != task.DueDate {
			changes["dueDate"] = dbClient.Change{From: task.DueDate, To: body.DueDate}
			task.DueDate = body.DueDate
		}

		if len(changes) == 0 {
			ctx.JSON(http.StatusOK, task)
			return
		}

		currentUserId, _ := routerUtils.GetUserIdFromSession(ctx)
		var user dbClient.User

		if err := postgres.First(&user, "id = ?", currentUserId).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get user")
			return
		}

		var latestChange dbClient.EntityVersionDocument
		options := options.FindOne().SetSort(gin.H{"version": -1})
		newChange := dbClient.EntityVersionDocument{
			Changes:   changes,
			Id:        task.ID,
			Author:    dbClient.ShortUserInfo{Id: user.ID, Name: user.Username, Picture: user.Picture},
			CreatedAt: time.Now(),
		}

		if err := tasksVersionCollection.FindOne(context.Background(), gin.H{"id": task.ID}, options).Decode(&latestChange); err != nil {
			if err != mongo.ErrNoDocuments {
				errorHandlers.InternalServerError(ctx, "failed to get task version")
				return
			}

			newChange.Version = 1
		} else {
			newChange.Version = latestChange.Version + 1
		}

		if _, err := tasksVersionCollection.InsertOne(context.Background(), newChange); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to insert task version")
			return
		}

		if err := postgres.Save(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update task")
			return
		}

		ctx.JSON(http.StatusOK, task)
	}
}
