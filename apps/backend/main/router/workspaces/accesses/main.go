package workspacesAccessesRouter

import (
	"github.com/gin-gonic/gin"
)

func AddRoutes(group *gin.RouterGroup) {
	group.GET("", getWorkspaceAccesses)

	group.PUT("", updateAccess)
}
