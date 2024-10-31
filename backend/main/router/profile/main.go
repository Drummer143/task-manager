package profileRouter

import (
	"main/storage"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, storage *storage.Storage, validate *validator.Validate, db *gorm.DB) {
	group.GET("", getProfile(db))

	group.PATCH("", patchProfile(validate, db))
	group.PATCH("/email", changeEmail(validate, db))
	group.PATCH("/avatar", uploadAvatar(storage, db))
}
