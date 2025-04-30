package profileRouter

import (
	"github.com/gin-gonic/gin"
)

func AddRoutes(group *gin.RouterGroup) {
	group.GET("", getProfile)
	group.GET("/current-workspace", getCurrentWorkspace)

	group.PATCH("", patchProfile)
	group.PATCH("/email", changeEmail)
	group.PATCH("/avatar", uploadAvatar)
}
