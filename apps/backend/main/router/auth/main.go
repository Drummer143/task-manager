package authRouter

import (
	"main/auth"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

const SESSION_TOKEN_LIFETIME = 24 * 7 * time.Hour
const EMAIL_VERIFICATION_TOKEN_LIFETIME = 30 * time.Minute

func AddRoutes(group *gin.RouterGroup, auth *auth.Auth, validate *validator.Validate, postgres *gorm.DB) {
	group.GET("/logout", logout)
	group.GET("/verify-reset-password-token", verifyResetPasswordToken(auth, postgres))

	group.POST("/login", login(auth, validate, postgres))
	group.POST("/sign-up", signUp(auth, validate, postgres))
	group.POST("/confirm-email", confirmEmail(auth, validate, postgres))
	group.POST("/reset-password", resetPassword(auth, validate, postgres))
	group.POST("/update-password", updatePassword(auth, validate, postgres))
}
