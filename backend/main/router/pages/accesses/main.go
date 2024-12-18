package accessesRouter

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, db *gorm.DB) {
	group.GET("", getPageAccesses(db))

	group.PUT("", updateAccess(db))
}
