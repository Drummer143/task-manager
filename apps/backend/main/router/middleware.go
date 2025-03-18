package router

import (
	"main/auth"
	"main/router/errorHandlers"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func IsAuthenticated(auth *auth.Auth) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		token := session.Get("token")

		if token == nil {
			errorHandlers.Unauthorized(ctx, "Session is missing or invalid")
			ctx.Abort()
			return
		}

		if _, err := auth.ValidateJWT(token.(string)); err != nil {
			session.Save()
			session.Clear()

			errorHandlers.Unauthorized(ctx, "Session is missing or invalid")
			ctx.Abort()
		} else {
			ctx.Next()
		}
	}
}
