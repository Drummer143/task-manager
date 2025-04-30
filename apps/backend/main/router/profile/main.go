package profileRouter

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func AddRoutes(group *gin.RouterGroup, validate *validator.Validate) {
	group.GET("", getProfile)
	group.GET("/current-workspace", getCurrentWorkspace)

	group.PATCH("", patchProfile(validate))
	group.PATCH("/email", changeEmail(validate))
	group.PATCH("/avatar", uploadAvatar)
}
