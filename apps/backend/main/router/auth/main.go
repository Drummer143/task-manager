package authRouter

import (
	"time"

	"github.com/gin-gonic/gin"
)

const SESSION_TOKEN_LIFETIME = 24 * 7 * time.Hour
const EMAIL_VERIFICATION_TOKEN_LIFETIME = 30 * time.Minute

func AddRoutes(group *gin.RouterGroup) {
	group.GET("/logout", logout)
	group.GET("/verify-reset-password-token", verifyResetPasswordToken)

	group.POST("/confirm-email", confirmEmail)
	group.POST("/reset-password", resetPassword)
	group.POST("/update-password", updatePassword)
}
