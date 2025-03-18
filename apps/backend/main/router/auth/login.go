package authRouter

import (
	"main/auth"
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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
// @Success			200 {object} dbClient.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/auth/login [post]
func login(auth *auth.Auth, validate *validator.Validate, postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body loginBody

		ctx.BindJSON(&body)

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request", validation.UnknownError)
			return
		}

		var user dbClient.User

		if err := postgres.Where("email = ?", body.Email).First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.BadRequest(ctx, "user with that email not found", nil)
				return
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get credentials")
				return
			}
		}

		var credentials dbClient.UserCredential

		if err := postgres.Where("user_id = ?", user.ID).First(&credentials).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.BadRequest(ctx, "user with that email not found", nil)
				return
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get credentials")
				return
			}
		}

		if err := bcrypt.CompareHashAndPassword([]byte(credentials.PasswordHash), []byte(body.Password)); err != nil {
			errorHandlers.BadRequest(ctx, "invalid password", nil)
			return
		}

		token, err := auth.GenerateJWT(user.Email, SESSION_TOKEN_LIFETIME)

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to generate token")
			return
		}

		postgres.Model(&user).Update("last_login", time.Now())

		session := sessions.Default(ctx)

		session.Set("id", user.ID)
		session.Set("token", token)

		if err := session.Save(); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to save session")
			return
		}

		ctx.JSON(http.StatusOK, user)
	}
}
