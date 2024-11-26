package boardsRouter

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, db *gorm.DB, validate *validator.Validate) {
	group.GET("", getBoardList(db))

	group.POST("", createBoard(db, validate))

	group.GET("/:id", getBoard(db))

	group.PUT("/:id", updateBoard(db, validate))

	group.DELETE("/:id", deleteBoard(db))

	group.POST("/:id/access", updateAccess(db))
}
