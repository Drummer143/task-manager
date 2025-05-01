package profileRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/internal/zitadel"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary			Synchronize Zitadel user
// @Description		Synchronize Zitadel user
// @Tags			Profile
// @Security		BearerAuth
// @Accept			json
// @Produce			json
// @Success			200	{object}	map[string]interface{}
// @Router			/profile/synchronize-zitadel-user/{user_id} [post]
func SynchronizeZitadelUser(ctx *gin.Context) {
	zitadelUserId := ctx.Param("user_id")

	if zitadelUserId == "" {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidParams, []string{"user_id"})
		return
	}

	zitadelUser, _ := zitadel.GetUserById(zitadelUserId)

	if zitadelUser == nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	var user postgres.User

	if err := postgres.DB.Where("email = ?", zitadelUser.User.Human.Email.Email).First(&user).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			errorHandlers.InternalServerError(ctx)
			return
		}

		user.Email = zitadelUser.User.Human.Email.Email
		user.EmailVerified = zitadelUser.User.Human.Email.IsVerified
		user.Username = zitadelUser.User.PreferredLoginName
		user.UpdatedAt = zitadelUser.Details.ChangeDate
		user.CreatedAt = zitadelUser.Details.ChangeDate

		if postgres.DB.Create(&user).Error != nil {
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	if user.ZitadelUserId == "" {
		user.ZitadelUserId = zitadelUserId

		if postgres.DB.Save(&user).Error != nil {
			errorHandlers.InternalServerError(ctx)
			return
		}
	}

	ctx.JSON(http.StatusOK, user)
}
