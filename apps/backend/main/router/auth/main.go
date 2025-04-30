package authRouter

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

const SESSION_TOKEN_LIFETIME = 24 * 7 * time.Hour
const EMAIL_VERIFICATION_TOKEN_LIFETIME = 30 * time.Minute

func AddRoutes(group *gin.RouterGroup, validate *validator.Validate) {
	group.GET("/logout", logout)
	group.GET("/verify-reset-password-token", verifyResetPasswordToken)

	group.POST("/login", login(validate))
	group.POST("/sign-up", signUp(validate))
	group.POST("/confirm-email", confirmEmail(validate))
	group.POST("/reset-password", resetPassword(validate))
	group.POST("/update-password", updatePassword(validate))
}
