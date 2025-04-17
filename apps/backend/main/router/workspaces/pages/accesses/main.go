package accessesRouter

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, postgres *gorm.DB) {
	group.GET("", getPageAccesses(postgres))

	group.PUT("", updateAccess(postgres))
}