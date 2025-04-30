package ginTools

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func MustGetUserIdFromSession(ctx *gin.Context) uuid.UUID {
	session := sessions.Default(ctx)

	userId, ok := session.Get("id").(uuid.UUID)

	if !ok {
		panic("Session is missing or invalid")
	}

	return userId
}
