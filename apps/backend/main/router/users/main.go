package usersRouter

import (
	"github.com/gin-gonic/gin"
)

func AddRoutes(group *gin.RouterGroup) {
	group.GET("", getUserList)
}
