package authRouter

import (
	"main/auth"
	"main/internal/postgres"
	"main/internal/validation"
	"main/router/errorHandlers"
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
			errorHandlers.BadRequest(ctx, "invalid request", errors)
			return
		}

		errorHandlers.BadRequest(ctx, "invalid request", validation.UnknownError)
		return
	}

	var userCredentials postgres.UserCredential

	if err := postgres.DB.Where("password_reset_token = ?", body.Token).First(&userCredentials).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.BadRequest(ctx, "invalid token", nil)
			return
		}

		errorHandlers.InternalServerError(ctx, "failed to get user credentials")
		return
	}

	if _, err := auth.ValidateJWT(body.Token); err != nil {
		errorHandlers.BadRequest(ctx, "invalid token", nil)
		return
	}

	var user postgres.User

	if err := postgres.DB.Where("id = ?", userCredentials.UserID).First(&user).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "error while updating password")
		return
	}

	passwordHash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)

	updatedAt := time.Now()

	userCredentials.PasswordHash = string(passwordHash)
	userCredentials.UpdatedAt = updatedAt
	userCredentials.PasswordResetToken = nil

	if err := postgres.DB.Save(&userCredentials).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "error while updating password")
		return
	}

	postgres.DB.Model(&user).Update("last_password_reset", updatedAt)

	ctx.Status(http.StatusNoContent)
}
