package tasksRouter

import (
	"context"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
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
// @Param			workspace_id path string true "Workspace ID"
// @Param			page_id path int true "Page ID"
// @Param			task_id path string true "Task ID"
// @Param			status body changeTaskStatusBody true "Task status. Must be one of: not_done, in_progress, done"
// @Success			200 {object} postgres.Task
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/status [patch]
func changeStatus(tasksVersionCollection *mongo.Collection, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task postgres.Task

		if err := postgres.DB.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
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
		var user postgres.User

		if err := postgres.DB.First(&user, "id = ?", currentUserId).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get user")
			return
		}

		var latestChange mongoClient.EntityVersionDocument
		options := options.FindOne().SetSort(gin.H{"version": -1})
		newChange := mongoClient.EntityVersionDocument{
			Changes:   map[string]mongoClient.Change{"status": {From: task.Status, To: body.Status}},
			Id:        task.ID,
			Author:    mongoClient.ShortUserInfo{Id: user.ID, Username: user.Username, Picture: user.Picture},
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

		if err := postgres.DB.Save(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update task")
		}

		ctx.JSON(http.StatusOK, task)
	}
}
