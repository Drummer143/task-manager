package tasksCharRouter

import (
	"main/internal/mongo"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func AddRoutes(group *gin.RouterGroup, validate *validator.Validate) {
	taskChatsCollection := mongo.DB.Database("chats").Collection("tasks")

	group.GET("", getMessages(taskChatsCollection))

	group.POST("", sendMessage(taskChatsCollection, validate))
}
