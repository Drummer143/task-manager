package tasksRouter

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, db *gorm.DB, validate *validator.Validate) {
	group.GET("", getTaskList(db))
	group.GET("/:id", getSingleTask(db))

	group.POST("", createTask(db, validate))

	group.PATCH("/:id/status", changeStatus(db, validate))

	group.PUT("/:id", updateTask(db, validate))

	group.DELETE("/:id", deleteTask(db))
}
