package tasksCharRouter

import (
	"context"
	mongoClient "main/internal/mongo"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// @Summary				Get messages
// @Description			Get messages
// @Tags				Tasks
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				page_id path int true "Page ID"
// @Param				task_id path string true "Task ID"
// @Param				limit query int false "Default is 10"
// @Param				offset query int false "Default is 0"
// @Success				200 {object} routerUtils.ResponseWithPagination[mongoClient.TaskChatMessage]
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/chat [get]
func getMessages(taskChatsCollection *mongo.Collection) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		taskId, err := uuid.Parse(ctx.Param("task_id"))

		if err != nil {
			errorHandlers.BadRequest(ctx, "invalid task id", nil)
			return
		}

		limit, offset := routerUtils.ValidatePaginationParams(ctx, routerUtils.DefaultPaginationLimit, routerUtils.DefaultPaginationOffset)

		options := options.Find().SetSort(gin.H{"createdat": -1}).SetLimit(int64(limit)).SetSkip(int64(offset))

		filter := gin.H{"taskid": taskId}

		cursor, err := taskChatsCollection.Find(ctx, filter, options)

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get messages")
			return
		}

		var messages []mongoClient.TaskChatMessage

		if err := cursor.All(context.Background(), &messages); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get messages")
			return
		}

		total, err := taskChatsCollection.CountDocuments(context.Background(), filter)

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get messages")
			return
		}

		if messages == nil {
			messages = []mongoClient.TaskChatMessage{}
		}

		ctx.JSON(http.StatusOK, routerUtils.ResponseWithPagination[mongoClient.TaskChatMessage]{
			Data: messages,
			Meta: routerUtils.Meta{
				Total:   int(total),
				Limit:   limit,
				Offset:  offset,
				HasMore: limit+offset < int(total),
			},
		})
	}
}
