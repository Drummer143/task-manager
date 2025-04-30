package authRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/utils/auth"
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
func verifyResetPasswordToken(ctx *gin.Context) {
	token := ctx.Query("token")

	if token == "" {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidToken, nil)
		return
	}

	var userCredentials postgres.UserCredential

	if err := postgres.DB.Where("password_reset_token = ?", token).First(&userCredentials).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidToken, nil)
			return
		}

		errorHandlers.InternalServerError(ctx)
		return
	}

	if _, err := auth.ValidateJWT(token); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidToken, nil)
		return
	}

	ctx.Status(http.StatusNoContent)
}
