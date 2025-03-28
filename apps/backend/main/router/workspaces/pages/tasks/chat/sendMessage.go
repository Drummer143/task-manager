package tasksCharRouter

import (
	"fmt"
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"main/socketManager"
	"main/validation"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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
// @Success			200 {object} dbClient.TaskChatMessage
// @Failure			400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error
// @Failure			500 {object} errorHandlers.Error
// @Router			/workspaces/{workspace_id}/pages/{page_id}/tasks/{task_id}/chat [post]
func sendMessage(postgres *gorm.DB, taskChatCollection *mongo.Collection, validate *validator.Validate, sockets *socketManager.SocketManager) gin.HandlerFunc {
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

		var body chatMessage

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request body", errors)
			} else {
				errorHandlers.BadRequest(ctx, "invalid request body", nil)
			}

			return
		}

		user_id, _ := routerUtils.GetUserIdFromSession(ctx)

		var user dbClient.User

		if err := postgres.First(&user, "id = ?", user_id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "user not found")
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get user")
			}

			return
		}

		chatMessage := dbClient.TaskChatMessage{
			Author:    dbClient.ShortUserInfo{Id: user.ID, Username: user.Username},
			Text:      body.Text,
			ID:        uuid.New(),
			TaskID:    task.ID,
			CreatedAt: time.Now(),
		}

		if _, err := taskChatCollection.InsertOne(ctx, chatMessage); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to send message")
			return
		}

		sockets.Broadcast(fmt.Sprintf("chat:%v", task.ID), chatMessage)

		ctx.JSON(200, chatMessage)
	}
}
