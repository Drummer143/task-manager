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

type patchProfileBody struct {
	Username string `json:"username" validate:"required"`
}

// @Summary			Update current user profile
// @Description		This endpoint updates the user profile information in the Auth0 Management API using the user's ID from the session. The ID is obtained from the session and used to query the user data from the external identity provider (Auth0). The user must be authenticated, and a valid session must exist. The request body must contain valid JSON data representing the user profile information.
// @Tags			Profile
// @Accept			json
// @Produce			json
// @Param			user body patchProfileBody  true "User profile data"
// @Success			200 {object} postgres.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error "User not found in Auth0 database"
// @Failure			429 {object} errorHandlers.Error "Rate limit exceeded"
// @Failure			500 {object} errorHandlers.Error "Internal server error if request to Auth0 fails"
// @Router			/profile [patch]
func patchProfile(ctx *gin.Context) {
	var body patchProfileBody

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

	user := ginTools.MustGetUser(ctx)

	user.Username = body.Username
	user.UpdatedAt = time.Now()

	if err := postgres.DB.Save(&user).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, user)
}
