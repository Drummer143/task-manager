package tasksRouter

import (
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
	group.GET("", getTaskList)
	group.GET("/:task_id", getSingleTask)
	// group.GET("/:task_id/history", getHistory(taskVersionsCollection))

	group.POST("", createTask)

	group.PATCH("/:task_id/status", changeStatus)

	group.PUT("/:task_id", updateTask)

	group.DELETE("/:task_id", deleteTask)

	tasksCharRouter.AddRoutes(group.Group("/:task_id/chat"))
}
