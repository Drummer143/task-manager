package authRouter

import (
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/auth"
	"main/utils/errorCodes"
	"main/utils/errorHandlers"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type loginBody struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// @Summary			Login
// @Description		Login
// @Tags			Auth
// @Accept			json
// @Produce			json
// @Param			body body loginBody true "Login object"
// @Success			200 {object} postgres.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/auth/login [post]
func login(ctx *gin.Context) {
	var body loginBody

	ctx.BindJSON(&body)

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
			return
		}

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, validation.UnknownError)
		return
	}

	var user postgres.User

	if err := postgres.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidCredentials, nil)
			return
		} else {
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	var credentials postgres.UserCredential

	if err := postgres.DB.Where("user_id = ?", user.ID).First(&credentials).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidCredentials, nil)
			return
		} else {
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(credentials.PasswordHash), []byte(body.Password)); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidCredentials, nil)
		return
	}

	token, err := auth.GenerateJWT(user.Email, SESSION_TOKEN_LIFETIME)

	if err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	postgres.DB.Model(&user).Update("last_login", time.Now())

	session := sessions.Default(ctx)

	selectedWorkspaceId := session.Get("selected_workspace")

	if selectedWorkspaceId != nil {
		var userMeta postgres.UserMeta

		if err := postgres.DB.Where("user_id = ?", user.ID).First(&userMeta).Error; err != nil {
			errorHandlers.InternalServerError(ctx)
			return
		}

		if userMeta.SelectedWorkspace != nil {
			session.Set("selected_workspace", userMeta.SelectedWorkspace)
		}
	}

	session.Set("id", user.ID)
	session.Set("token", token)

	if err := session.Save(); err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, user)
}
