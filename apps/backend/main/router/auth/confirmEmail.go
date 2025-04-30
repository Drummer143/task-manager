package authRouter

import (
	"main/auth"
	"main/internal/postgres"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type confirmEmailBody struct {
	Token string `json:"token" validate:"required"`
}

// @Summary			Confirm email
// @Description		Confirm email
// @Tags			Auth
// @Accept			json
// @Produce		    json
// @Param			body body confirmEmailBody true "Confirm email object"
// @Success			204 "No Content"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if token is invalid"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/auth/confirm-email [post]
func confirmEmail(validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body confirmEmailBody

		ctx.BindJSON(&body)

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request", "Invalid request body")
			return
		}

		var userCredentials postgres.UserCredential

		if err := postgres.DB.Where("email_verification_token = ?", body.Token).First(&userCredentials).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.BadRequest(ctx, "invalid token", "Invalid token.")
				return
			}

			errorHandlers.InternalServerError(ctx, "Error while confirming email")
			return
		}

		if _, err := auth.ValidateJWT(body.Token); err != nil {
			errorHandlers.Unauthorized(ctx, "Invalid token.")
			return
		}

		var user postgres.User

		if err := postgres.DB.First(&user, "id = ?", userCredentials.UserID.String()).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Error while confirming email")
			return
		}

		if err := postgres.DB.Model(&userCredentials).Update("email_verification_token", nil).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Error while confirming email")
			return
		}

		if err := postgres.DB.Model(&user).Update("email_verified", true).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Error while confirming email")
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
