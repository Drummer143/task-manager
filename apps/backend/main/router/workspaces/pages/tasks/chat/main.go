package tasksCharRouter

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, postgres *gorm.DB, mongo *mongo.Client, validate *validator.Validate) {
	taskChatsCollection := mongo.Database("chats").Collection("tasks")

	group.POST("", sendMessage(postgres, taskChatsCollection, validate))
}
