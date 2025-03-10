package tasksRouter

import (
	"context"
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/gorm"
)

type getHistoryResponse struct {
	History []dbClient.EntityVersionDocument `json:"history"`
	Current dbClient.Task                    `json:"current"`
}

// @Summary				Get task history
// @Description			Get task history
// @Tags				Tasks
// @Produce				json
// @Param				id path string true "Task ID"
// @Success				200 {object} []dbClient.Task
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/history [get]
func getHistory(postgres *gorm.DB, tasksVersionCollection *mongo.Collection) gin.HandlerFunc {
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

		var history []dbClient.EntityVersionDocument
		options := options.Find().SetSort(gin.H{"version": -1})

		cursor, err := tasksVersionCollection.Find(context.Background(), map[string]interface{}{"id": task.ID}, options)

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get task history")
			return
		}

		if err = cursor.All(context.Background(), &history); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get task history")
			return
		}

		ctx.JSON(http.StatusOK, getHistoryResponse{History: history, Current: task})
	}
}
