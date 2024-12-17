package pagesRouter

import (
	accessesRouter "main/router/pages/accesses"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, db *gorm.DB, validate *validator.Validate) {
	group.GET("", getPageList(db))

	group.POST("", createPage(db, validate))

	group.GET("/:id", getPage(db))

	group.PUT("/:id", updatePage(db, validate))

	group.DELETE("/:id", deletePage(db))

	accessesRouter.AddRoutes(group.Group("/:id/accesses"), db)
}
