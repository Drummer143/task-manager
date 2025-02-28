package workspacesAccessesRouter

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, db *gorm.DB) {
	group.GET("", getWorkspaceAccesses(db))

	group.PUT("", updateAccess(db))
}
