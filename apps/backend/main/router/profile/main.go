package profileRouter

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, validate *validator.Validate, postgres *gorm.DB) {
	group.GET("", getProfile(postgres))

	group.PATCH("", patchProfile(validate, postgres))
	group.PATCH("/email", changeEmail(validate, postgres))
	group.PATCH("/avatar", uploadAvatar(postgres))
}
