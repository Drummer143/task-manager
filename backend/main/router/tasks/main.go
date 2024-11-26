package tasksRouter

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type SocketMessageRequest struct {
	Type string          `json:"type"`
	Body json.RawMessage `json:"body"`
}

type SocketMessageResponse struct {
	Type string `json:"type"`
	Body any    `json:"body"`
}

func AddRoutes(group *gin.RouterGroup, db *gorm.DB, validate *validator.Validate) {
	group.GET("/socket", handleSocket(db, validate))
}
