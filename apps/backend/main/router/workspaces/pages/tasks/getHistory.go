package tasksRouter

import (
	"context"
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
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
// @Success				200 {object} routerUtils.ResponseWithPagination[dbClient.EntityVersionDocument]
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

		total, err := tasksVersionCollection.CountDocuments(context.Background(), map[string]interface{}{"id": task.ID})

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get task history")
			return
		}

		limit, offset := routerUtils.ValidatePaginationParams(ctx, routerUtils.DefaultPaginationLimit, routerUtils.DefaultPaginationOffset)

		var history []dbClient.EntityVersionDocument
		options := options.Find().SetSort(gin.H{"version": -1}).SetSkip(int64(offset)).SetLimit(int64(limit))

		cursor, err := tasksVersionCollection.Find(context.Background(), map[string]interface{}{"id": task.ID}, options)

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get task history")
			return
		}

		if err = cursor.All(context.Background(), &history); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get task history")
			return
		}

		ctx.JSON(http.StatusOK, routerUtils.ResponseWithPagination[dbClient.EntityVersionDocument]{
			Data: history,
			Meta: routerUtils.Meta{
				Total:   int(total),
				Offset:  offset,
				Limit:   limit,
				HasMore: offset+limit < int(total),
			},
		})
	}
}
