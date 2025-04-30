package tasksRouter

import (
	"main/internal/mongo"
	tasksCharRouter "main/router/workspaces/pages/tasks/chat"
	"main/socketManager"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type taskStatus = string

var (
	NotDone    taskStatus = "not_done"
	InProgress taskStatus = "in_progress"
	Done       taskStatus = "done"
)

func AddRoutes(group *gin.RouterGroup, validate *validator.Validate, sockets *socketManager.SocketManager) {
	taskVersionsCollection := mongo.DB.Database("versions").Collection("tasks")

	group.GET("", getTaskList)
	group.GET("/:task_id", getSingleTask)
	group.GET("/:task_id/history", getHistory(taskVersionsCollection))

	group.POST("", createTask(validate))

	group.PATCH("/:task_id/status", changeStatus(taskVersionsCollection, validate))

	group.PUT("/:task_id", updateTask(taskVersionsCollection, validate))

	group.DELETE("/:task_id", deleteTask)

	tasksCharRouter.AddRoutes(group.Group("/:task_id/chat"), validate, sockets)
}
