package tasksRouter

import (
	"context"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
	"main/utils/errorCodes"
	"main/utils/errorHandlers"
	"main/utils/pagination"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/gorm"
)

// @Summary				Get task history
// @Description			Get task history
// @Tags				Tasks
// @Produce				json
// @Param				page_id path string true "Page ID"
// @Param				workspace_id path string true "Workspace ID"
// @Param				task_id path string true "Task ID"
// @Param				limit query int false "If not provided or less than 1, all users will be returned"
// @Param				offset query int false "Default is 0"
// @Success				200 {object} pagination.ResponseWithPagination[mongo.EntityVersionDocument]
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/history [get]
func getHistory(tasksVersionCollection *mongo.Collection) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task postgres.Task

		if err := postgres.DB.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityTask)
			} else {
				errorHandlers.InternalServerError(ctx)
			}

			return
		}

		total, err := tasksVersionCollection.CountDocuments(context.Background(), gin.H{"id": task.ID})

		if err != nil {
			errorHandlers.InternalServerError(ctx)
			return
		}

		limit, offset := pagination.ValidatePaginationParams(ctx, pagination.DefaultPaginationLimit, pagination.DefaultPaginationOffset)

		var history []mongoClient.EntityVersionDocument
		options := options.Find().SetSort(gin.H{"version": -1}).SetSkip(int64(offset)).SetLimit(int64(limit))

		cursor, err := tasksVersionCollection.Find(context.Background(), gin.H{"id": task.ID}, options)

		if err != nil {
			errorHandlers.InternalServerError(ctx)
			return
		}

		if err = cursor.All(context.Background(), &history); err != nil {
			errorHandlers.InternalServerError(ctx)
			return
		}

		if history == nil {
			history = []mongoClient.EntityVersionDocument{}
		}

		ctx.JSON(http.StatusOK, pagination.NewResponseWithPagination(history, limit, offset, int(total)))
	}
}
