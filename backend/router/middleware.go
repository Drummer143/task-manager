package router

import (
	"main/router/errorHandlers"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func IsAuthenticated(ctx *gin.Context) {
	if sessions.Default(ctx).Get("profile") == nil {
		errorHandlers.Unauthorized(ctx, "Session is missing or invalid")
		ctx.Abort()
	} else {
		ctx.Next()
	}
}
