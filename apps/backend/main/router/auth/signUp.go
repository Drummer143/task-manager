package authRouter

import (
	"fmt"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/auth"
	"main/utils/errorCodes"
	"main/utils/errorHandlers"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"golang.org/x/crypto/bcrypt"
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
// @Success			201 {object} postgres.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/auth/sign-up [post]
func signUp(ctx *gin.Context) {
	var body signUpBody

	ctx.BindJSON(&body)

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
			return
		}

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, validation.UnknownError)
		return
	}

	tx := postgres.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
			return
		}
	}()

	if err := tx.Create(&postgres.User{
		Email:     body.Email,
		Username:  body.Username,
		LastLogin: time.Now(),
	}).Error; err != nil {
		tx.Rollback()

		if err.Error() == "ERROR: duplicate key value violates unique constraint \"users_email_key\" (SQLSTATE 23505)" {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeEmailTaken, nil)
			return
		}

		errorHandlers.InternalServerError(ctx)
		return
	}

	passwordHash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)

	var user postgres.User

	if err := tx.First(&user, "email = ?", body.Email).Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	emailVerificationToken, _ := auth.GenerateJWT(user.Email, EMAIL_VERIFICATION_TOKEN_LIFETIME)

	if err := tx.Create(&postgres.UserCredential{
		UserID:                 user.ID,
		PasswordHash:           string(passwordHash),
		EmailVerificationToken: &emailVerificationToken,
	}).Error; err != nil {
		errorHandlers.InternalServerError(ctx)

		tx.Delete(&user)
		tx.Rollback()

		return
	}

	userWorkspace := postgres.Workspace{
		OwnerID: user.ID,
		Name: fmt.Sprintf(
			"%s's workspace",
			user.Username,
		),
	}

	if err := tx.Create(&userWorkspace).Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	userWorkspaceAccess := postgres.WorkspaceAccess{
		WorkspaceID: userWorkspace.ID,
		UserID:      user.ID,
		Role:        postgres.UserRoleOwner,
	}

	if err := tx.Create(&userWorkspaceAccess).Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	userMeta := postgres.UserMeta{
		UserID:            user.ID,
		SelectedWorkspace: &userWorkspace.ID,
	}

	if err := tx.Create(&userMeta).Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		errorHandlers.InternalServerError(ctx)
		return
	}

	token, _ := auth.GenerateJWT(user.Email, SESSION_TOKEN_LIFETIME)

	session := sessions.Default(ctx)

	session.Set("token", token)
	session.Set("id", user.ID)
	session.Set("selected_workspace", userWorkspace.ID)
	session.Save()

	url := mailerUrl + "/send-email-confirmation"

	resty.New().R().SetBody(gin.H{"email": user.Email, "token": emailVerificationToken}).Post(url)

	ctx.JSON(http.StatusCreated, user)
}
