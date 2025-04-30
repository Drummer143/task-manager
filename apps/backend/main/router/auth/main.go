package authRouter

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

const SESSION_TOKEN_LIFETIME = 24 * 7 * time.Hour
const EMAIL_VERIFICATION_TOKEN_LIFETIME = 30 * time.Minute

func AddRoutes(group *gin.RouterGroup, validate *validator.Validate, postgres *gorm.DB) {
	group.GET("/logout", logout)
	group.GET("/verify-reset-password-token", verifyResetPasswordToken(postgres))

	group.POST("/login", login(validate, postgres))
	group.POST("/sign-up", signUp(validate, postgres))
	group.POST("/confirm-email", confirmEmail(validate, postgres))
	group.POST("/reset-password", resetPassword(validate, postgres))
	group.POST("/update-password", updatePassword(validate, postgres))
}
