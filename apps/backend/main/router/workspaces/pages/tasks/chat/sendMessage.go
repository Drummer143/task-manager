package tasksCharRouter

import (
	"fmt"
	mongoClient "main/internal/mongo"
	"main/internal/postgres"
	"main/internal/socketManager"
	"main/internal/validation"
	"main/utils/errorHandlers"
	"main/utils/ginTools"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

type chatMessage struct {
	Text string `json:"text" validate:"required"`
}

// @Summary			Send Message in task chat
// @Description		Send Message in task chat
// @Tags			Tasks Chat
// @Accept			json
// @Produce			json
// @Param			workspace_id path string true "Workspace ID"
// @Param			page_id path int true "Page ID"
// @Param			task_id path string true "Task ID"
// @Param			message body chatMessage true "Message"
// @Success			200 {object} mongoClient.TaskChatMessage
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/chat [post]
func sendMessage(taskChatCollection *mongo.Collection) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var task postgres.Task

		if err := postgres.DB.First(&task, "id = ?", ctx.Param("task_id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "task not found")
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get task")
			}

			return
		}

		var body chatMessage

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validation.Validator.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request body", errors)
			} else {
				errorHandlers.BadRequest(ctx, "invalid request body", nil)
			}

			return
		}

		userId := ginTools.MustGetUserIdFromSession(ctx)

		var user postgres.User

		if err := postgres.DB.First(&user, "id = ?", userId).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "user not found")
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get user")
			}

			return
		}

		chatMessage := mongoClient.TaskChatMessage{
			Author:    mongoClient.ShortUserInfo{Id: user.ID, Username: user.Username},
			Text:      body.Text,
			ID:        uuid.New(),
			TaskID:    task.ID,
			CreatedAt: time.Now(),
		}

		if _, err := taskChatCollection.InsertOne(ctx, chatMessage); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to send message")
			return
		}

		socketManager.Manager.Broadcast(fmt.Sprintf("chat:%v", task.ID), chatMessage)

		ctx.JSON(200, chatMessage)
	}
}
