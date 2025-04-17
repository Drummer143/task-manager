package tasksRouter

import (
	tasksCharRouter "main/router/workspaces/pages/tasks/chat"
	"main/socketManager"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

type taskStatus = string

var (
	NotDone    taskStatus = "not_done"
	InProgress taskStatus = "in_progress"
	Done       taskStatus = "done"
)

func AddRoutes(group *gin.RouterGroup, postgres *gorm.DB, mongo *mongo.Client, validate *validator.Validate, sockets *socketManager.SocketManager) {
	taskVersionsCollection := mongo.Database("versions").Collection("tasks")

	group.GET("", getTaskList(postgres))
	group.GET("/:task_id", getSingleTask(postgres))
	group.GET("/:task_id/history", getHistory(postgres, taskVersionsCollection))

	group.POST("", createTask(postgres, validate))

	group.PATCH("/:task_id/status", changeStatus(postgres, taskVersionsCollection, validate))

	group.PUT("/:task_id", updateTask(postgres, taskVersionsCollection, validate))

	group.DELETE("/:task_id", deleteTask(postgres))

	tasksCharRouter.AddRoutes(group.Group("/:task_id/chat"), postgres, mongo, validate, sockets)
}