package ginTools

import (
	"main/internal/postgres"

	"github.com/gin-gonic/gin"
)

func MustGetUser(ctx *gin.Context) postgres.User {
	rawUser, ok := ctx.Get("user")

	if !ok {
		panic("Session is missing or invalid")
	}

	user, ok := rawUser.(postgres.User)

	if !ok {
		panic("User is missing or invalid")
	}

	return user
}
