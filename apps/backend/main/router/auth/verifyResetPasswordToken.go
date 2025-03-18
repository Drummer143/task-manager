package authRouter

import (
	"main/auth"
	"main/dbClient"
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary			Verify reset password token
// @Description		Verify reset password token
// @Tags			Auth
// @Accept			json
// @Produce			json
// @Param			token query string true "Token"
// @Success			204 "No Content"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/auth/verify-reset-password-token [get]
func verifyResetPasswordToken(auth *auth.Auth, postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.Query("token")

		if token == "" {
			errorHandlers.BadRequest(ctx, "invalid token", nil)
			return
		}

		var userCredentials dbClient.UserCredential

		if err := postgres.Where("password_reset_token = ?", token).First(&userCredentials).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.BadRequest(ctx, "invalid token", nil)
				return
			}

			errorHandlers.InternalServerError(ctx, "failed to get user credentials")
			return
		}

		if _, err := auth.ValidateJWT(token); err != nil {
			errorHandlers.BadRequest(ctx, "invalid token", nil)
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
