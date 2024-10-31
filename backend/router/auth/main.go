package authRouter

import (
	"main/auth"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, auth *auth.Auth, validate *validator.Validate, db *gorm.DB) {

	group.POST("/login", login(auth, validate, db))
	group.POST("/sign-up", signUp(auth, validate, db))
}
