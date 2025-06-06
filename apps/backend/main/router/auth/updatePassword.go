package authRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/auth"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type updatePasswordBody struct {
	Password string `json:"password" validate:"required,min=8,max=16"`
	Token    string `json:"token" validate:"required"`
}

func updatePassword(ctx *gin.Context) {
	var body updatePasswordBody

	ctx.BindJSON(&body)

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
			return
		}

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, validation.UnknownError)
		return
	}

	var userCredentials postgres.UserCredential

	if err := postgres.DB.Where("password_reset_token = ?", body.Token).First(&userCredentials).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidToken, nil)
			return
		}

		errorHandlers.InternalServerError(ctx)
		return
	}

	if _, err := auth.ValidateJWT(body.Token); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidToken, nil)
		return
	}

	var user postgres.User

	if err := postgres.DB.Where("id = ?", userCredentials.UserID).First(&user).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	passwordHash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)

	updatedAt := time.Now()

	userCredentials.PasswordHash = string(passwordHash)
	userCredentials.UpdatedAt = updatedAt
	userCredentials.PasswordResetToken = nil

	if err := postgres.DB.Save(&userCredentials).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	postgres.DB.Model(&user).Update("last_password_reset", updatedAt)

	ctx.Status(http.StatusNoContent)
}
