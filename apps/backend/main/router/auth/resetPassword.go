package authRouter

import (
	"main/auth"
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/go-resty/resty/v2"
	"gorm.io/gorm"
)

type resetPasswordBody struct {
	Email string `json:"email" validate:"required,email"`
}

// @Summary			Reset password
// @Description		Reset password
// @Tags			Auth
// @Accept			json
// @Produce			json
// @Param			body body resetPasswordBody true "Reset password object"
// @Success			204 "No Content"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/auth/reset-password [post]
func resetPassword(auth *auth.Auth, validate *validator.Validate, postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body resetPasswordBody

		ctx.BindJSON(&body)

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, errors["email"], nil)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request", validation.UnknownError)
			return
		}

		var user dbClient.User

		if err := postgres.Where("email = ?", body.Email).First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "user with this email does not exists")
				return
			}

			errorHandlers.InternalServerError(ctx, "failed to find user")
		}

		var userCredentials dbClient.UserCredential

		postgres.Where("user_id = ?", user.ID.String()).First(&userCredentials)

		resetPasswordToken, _ := auth.GenerateJWT(user.Email, EMAIL_VERIFICATION_TOKEN_LIFETIME)

		if err := postgres.Model(&userCredentials).Update("password_reset_token", resetPasswordToken).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "error while creating reset password token")
			return
		}

		url := os.Getenv("MAILER_URL") + "/send-reset-password"

		if resp, err := resty.New().R().SetBody(gin.H{"email": user.Email, "token": resetPasswordToken}).Post(url); err != nil || resp.StatusCode() > 299 {
			errorHandlers.InternalServerError(ctx, "failed to send email")
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
