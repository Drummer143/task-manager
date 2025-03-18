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
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
func changeStatus(postgres *gorm.DB, tasksVersionCollection *mongo.Collection, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task dbClient.Task

		if err := postgres.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
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

		if task.Status == body.Status {
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
			Changes:   map[string]dbClient.Change{"status": {From: task.Status, To: body.Status}},
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

		task.Status = body.Status

		if err := postgres.Save(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update task")
		}

		ctx.JSON(http.StatusOK, task)
	}
}
