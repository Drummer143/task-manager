package usersRouter

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, db *gorm.DB) {
	group.GET("", getUserList(db))
}