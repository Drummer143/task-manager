package tasksRouter

import (
	"main/internal/mongo"
	tasksCharRouter "main/router/workspaces/pages/tasks/chat"

	"github.com/gin-gonic/gin"
)

type taskStatus = string

var (
	NotDone    taskStatus = "not_done"
	InProgress taskStatus = "in_progress"
	Done       taskStatus = "done"
)

func AddRoutes(group *gin.RouterGroup) {
	taskVersionsCollection := mongo.DB.Database("versions").Collection("tasks")

	group.GET("", getTaskList)
	group.GET("/:task_id", getSingleTask)
	group.GET("/:task_id/history", getHistory(taskVersionsCollection))

	group.POST("", createTask)

	group.PATCH("/:task_id/status", changeStatus(taskVersionsCollection))

	group.PUT("/:task_id", updateTask(taskVersionsCollection))

	group.DELETE("/:task_id", deleteTask)

	tasksCharRouter.AddRoutes(group.Group("/:task_id/chat"))
}
