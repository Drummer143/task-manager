package tasksRouter

import (
	"context"
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/gorm"
)

// @Summary			Get a task
// @Description		Get a task
// @Tags			Tasks
// @Produce			json
// @Param			workspace_id path string true "Workspace ID"
// @Param			page_id path int true "Page ID"
// @Param			task_id path string true "Task ID"
// @Success			200 {object} postgres.Task
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id} [get]
func getSingleTask(ctx *gin.Context) {
	var task postgres.Task

	if err := postgres.DB.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityTask)
		} else {
			errorHandlers.InternalServerError(ctx)
		}

		return
	}

	taskDescriptionCollection := mongoClient.DB.Database("task").Collection("description")

	options := options.FindOne().SetSort(gin.H{"version": -1})

	var taskDescription mongoClient.EditorContent

	if err := taskDescriptionCollection.FindOne(context.Background(), gin.H{"pageid": task.ID}, options).Decode(&taskDescription); err != nil {
		if err == mongo.ErrNoDocuments {
			task.Description = nil
		} else {
			errorHandlers.InternalServerError(ctx)
			return
		}
	} else {
		task.Description = &taskDescription
	}

	ctx.JSON(http.StatusOK, task)
}
