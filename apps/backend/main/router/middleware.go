package router

import (
	"main/auth"
	"main/router/errorHandlers"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func IsAuthenticated(ctx *gin.Context) {
	session := sessions.Default(ctx)

	token := session.Get("token")

	if token == nil {
		session.Clear()
		session.Save()

		errorHandlers.Unauthorized(ctx, "Session is missing or invalid")

		ctx.Abort()

		return
	}

	if _, err := auth.ValidateJWT(token.(string)); err != nil {
		session.Clear()
		session.Save()

		errorHandlers.Unauthorized(ctx, "Session is missing or invalid")

		ctx.Abort()
	} else {
		ctx.Next()
	}
}
