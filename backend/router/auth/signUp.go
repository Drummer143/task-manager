package authRouter

import (
	"main/auth"
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// @Summary			Sign up
// @Description		Sign up
// @Tags			Auth
// @Accept			json
// @Produce			json
// @Param			body body signUpBody true "Sign up object"
// @Success			201 {object} dbClient.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/auth/sign-up [post]
func signUp(auth *auth.Auth, validate *validator.Validate, db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body signUpBody

		ctx.BindJSON(&body)

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request", validation.UnknownError)
			return
		}

		if err := db.Create(&dbClient.User{
			Email:    body.Email,
			Username: body.Username,
		}).Error; err != nil {
			if err.Error() == "ERROR: duplicate key value violates unique constraint \"users_email_key\" (SQLSTATE 23505)" {
				errorHandlers.BadRequest(ctx, "user with this email already exists", nil)
				return
			}

			errorHandlers.InternalServerError(ctx, "failed to create user")
			return
		}

		var user dbClient.User

		db.First(&dbClient.User{}, "email = ?", body.Email)

		passwordHash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)

		db.First(&user, "email = ?", body.Email)

		if err := db.Create(&dbClient.UserCredentials{
			UserID:       user.ID,
			PasswordHash: string(passwordHash),
		}).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create user credentials")

			db.Delete(&user)

			return
		}

		token, _ := auth.GenerateJWT(user.Email)

		session := sessions.Default(ctx)

		session.Set("token", token)
		session.Set("id", user.ID)
		session.Save()

		ctx.JSON(http.StatusCreated, user)
	}
}
