package tasksCharRouter

import (
	"main/internal/mongo"

	"github.com/gin-gonic/gin"
)

func AddRoutes(group *gin.RouterGroup) {
	taskChatsCollection := mongo.DB.Database("chats").Collection("tasks")

	group.GET("", getMessages(taskChatsCollection))

	group.POST("", sendMessage(taskChatsCollection))
}
