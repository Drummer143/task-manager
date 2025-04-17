package authRouter

import (
	"fmt"
	"main/auth"
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/go-resty/resty/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type signUpBody struct {
	Email    string `json:"email" validate:"required,email,min=5,max=30"`
	Password string `json:"password" validate:"required,min=8,max=16"`
	Username string `json:"username" validate:"required"`
}

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
func signUp(auth *auth.Auth, validate *validator.Validate, postgres *gorm.DB) gin.HandlerFunc {
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

		tx := postgres.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
				errorHandlers.InternalServerError(ctx, "An unexpected error occurred")
				return
			}
		}()

		if err := tx.Create(&dbClient.User{
			Email:     body.Email,
			Username:  body.Username,
			LastLogin: time.Now(),
		}).Error; err != nil {
			tx.Rollback()

			if err.Error() == "ERROR: duplicate key value violates unique constraint \"users_email_key\" (SQLSTATE 23505)" {
				errorHandlers.BadRequest(ctx, "user with this email already exists", nil)
				return
			}

			errorHandlers.InternalServerError(ctx, "failed to create user")
			return
		}

		passwordHash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)

		var user dbClient.User

		if err := tx.First(&user, "email = ?", body.Email).Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to get user")
			return
		}

		emailVerificationToken, _ := auth.GenerateJWT(user.Email, EMAIL_VERIFICATION_TOKEN_LIFETIME)

		if err := postgres.Create(&dbClient.UserCredential{
			UserID:                 user.ID,
			PasswordHash:           string(passwordHash),
			EmailVerificationToken: &emailVerificationToken,
		}).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create user")

			tx.Delete(&user)
			tx.Rollback()

			return
		}

		userWorkspace := dbClient.Workspace{
			OwnerID: user.ID,
			Name: fmt.Sprintf(
				"%s's workspace",
				user.Username,
			),
		}

		if err := tx.Create(&userWorkspace).Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to create user")
			return
		}

		userWorkspaceAccess := dbClient.WorkspaceAccess{
			WorkspaceID: userWorkspace.ID,
			UserID:      user.ID,
			Role:        dbClient.UserRoleOwner,
		}

		if err := tx.Create(&userWorkspaceAccess).Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to create user")
			return
		}

		userMeta := dbClient.UserMeta{
			UserID:            user.ID,
			SelectedWorkspace: &userWorkspace.ID,
		}

		if err := tx.Create(&userMeta).Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to create user")
			return
		}

		if err := tx.Commit().Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to create user")
			return
		}

		token, _ := auth.GenerateJWT(user.Email, SESSION_TOKEN_LIFETIME)

		session := sessions.Default(ctx)

		session.Set("token", token)
		session.Set("id", user.ID)
		session.Set("selected_workspace", userWorkspace.ID)
		session.Save()

		url := os.Getenv("MAILER_URL") + "/send-email-confirmation"

		resty.New().R().SetBody(gin.H{"email": user.Email, "token": emailVerificationToken}).Post(url)

		ctx.JSON(http.StatusCreated, user)
	}
}
