package router

import (
	"mailer/mail"
	"mailer/router/errorHandlers"
	"net/http"

	"github.com/gin-gonic/gin"
)

type resetPasswordRequest struct {
	Email string `json:"email"`
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

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request", err)
			return
		}

		if err := mailer.SendResetPasswordMessage(body.Email, body.Token); err != nil {
			errorHandlers.InternalServerError(ctx, "error while sending email")
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}