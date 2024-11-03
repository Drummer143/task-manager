package authRouter

import (
	"fmt"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// @Summary Log out
// @Description Log out
// @Tags auth
// @Accept json
// @Produce json
// @Success 204 "No Content"
// @Router /auth/logout [post]
func logout(ctx *gin.Context) {
	session := sessions.Default(ctx)

	token := session.Get("token")

	fmt.Println(token)

	session.Clear()

	session.Save()

	ctx.Status(204)
}
