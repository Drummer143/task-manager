package accessesRouter

import (
	"github.com/gin-gonic/gin"
)

func AddRoutes(group *gin.RouterGroup) {
	group.GET("", getPageAccesses)

	group.PUT("", updateAccess)
}
