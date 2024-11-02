package authRouter

import (
	"main/auth"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

const EMAIL_VERIFICATION_TOKEN_LIFETIME = 30 * time.Minute
const SESSION_TOKEN_LIFETIME = 24 * 7 * time.Hour

func AddRoutes(group *gin.RouterGroup, auth *auth.Auth, validate *validator.Validate, db *gorm.DB) {
	group.GET("/verify-reset-password-token", verifyResetPasswordToken(auth, db))

	group.POST("/login", login(auth, validate, db))
	group.POST("/sign-up", signUp(auth, validate, db))
	group.POST("/confirm-email", confirmEmail(auth, validate, db))
	group.POST("/reset-password", resetPassword(auth, validate, db))
	group.POST("/update-password", updatePassword(auth, validate, db))
}
