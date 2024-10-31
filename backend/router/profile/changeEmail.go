package profileRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/utils"
	"main/validation"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

// @Summary			Change user email
// @Description		Update email of the current user
// @Tags			Profile
// @Accept			json
// @Produce			json
// @Param			email body changeEmailBody true "User email"
// @Success			200 {object} dbClient.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Email is invalid or missing"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.BadRequestError "User not found in database"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/profile/email [patch]
func changeEmail(validate *validator.Validate, db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		profile, _ := session.Get("profile").(map[string]interface{})

		var user dbClient.User

		if err := db.First(&user, "user_id = ?", profile["sub"].(string)).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "user not found")
				return
			} else {
				errorHandlers.InternalServerError(ctx, "failed to get user")
				return
			}
		}

		var body changeEmailBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to read request body")
			return
		}

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "validation error", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request", map[string]string{"email": "invalid email"})
			return
		}

		user.Email = body.Email
		user.UpdatedAt = utils.GetTimestampTz()

		if err := db.Save(&user).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update user")
			return
		}

		ctx.JSON(http.StatusOK, user)
	}
}
