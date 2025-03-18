package authRouter

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// @Summary 			Log out
// @Description 		Log out
// @Tags 				Auth
// @Accept 				json
// @Produce 			json
// @Success 			204 "No Content"
// @Router 				/auth/logout [post]
func logout(ctx *gin.Context) {
	session := sessions.Default(ctx)

	session.Clear()

	session.Save()

	ctx.Status(204)
}
