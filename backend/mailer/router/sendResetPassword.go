package router

import (
	"mailer/mail"
	"mailer/router/errorHandlers"
	"net/http"

	"github.com/gin-gonic/gin"
)

type resetPasswordRequest struct {
	Link  string `json:"link"`
	Token string `json:"token"`
}

// @Summary			Send reset password mail
// @Description		Send reset password mail
// @Accept			json
// @Produce			json
// @Param			body body resetPasswordRequest true "Send reset password object"
// @Success			204 "No Content"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/send-reset-password [post]
func resetPassword(mailer *mail.Mailer) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body resetPasswordRequest

		ctx.BindJSON(&body)

		if err := mailer.SendResetPasswordMessage(body.Link, body.Token); err != nil {
			errorHandlers.InternalServerError(ctx, "error while sending email")
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
