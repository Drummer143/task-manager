package profileRouter

import (
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/errorHandlers"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
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
	session := sessions.Default(ctx)

	userId := session.Get("id").(uuid.UUID)

	var user postgres.User

	if err := postgres.DB.First(&user, "id = ?", userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, "user not found")
			return
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get user")
			return
		}
	}

	var body patchProfileBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.InternalServerError(ctx, "failed to read request body")
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, "invalid request", errors)
			return
		}

		errorHandlers.BadRequest(ctx, "invalid request", validation.UnknownError)
		return
	}

	user.Username = body.Username
	user.UpdatedAt = time.Now()

	if err := postgres.DB.Save(&user).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "failed to update user")
		return
	}

	ctx.JSON(http.StatusOK, user)
}
