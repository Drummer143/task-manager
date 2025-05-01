package profileRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/ginTools"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type changeEmailBody struct {
	Email string `json:"email" validate:"required,email"`
}

// @Summary			Change user email
// @Description		Update email of the current user
// @Tags			Profile
// @Accept			json
// @Produce			json
// @Param			email body changeEmailBody true "User email"
// @Success			200 {object} postgres.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Email is invalid or missing"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error "User not found in database"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/profile/email [patch]
func changeEmail(ctx *gin.Context) {
	user := ginTools.MustGetUser(ctx)

	var body changeEmailBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeValidationErrors, errors)
			return
		}

		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	user.Email = body.Email
	user.UpdatedAt = time.Now()

	if err := postgres.DB.Save(&user).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, user)
}
