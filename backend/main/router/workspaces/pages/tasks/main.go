package tasksRouter

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type taskStatus = string

var (
	NotDone    taskStatus = "not_done"
	InProgress taskStatus = "in_progress"
	Done       taskStatus = "done"
)

func AddRoutes(group *gin.RouterGroup, db *gorm.DB, validate *validator.Validate) {
	group.GET("", getTaskList(db))
	group.GET("/:task_id", getSingleTask(db))

	group.POST("", createTask(db, validate))

	group.PATCH("/:task_id/status", changeStatus(db, validate))

	group.PUT("/:task_id", updateTask(db, validate))

	group.DELETE("/:task_id", deleteTask(db))
}
