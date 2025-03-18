package router

import (
	"net/http"

	"mailer/mail"
	"mailer/router/errorHandlers"

	"github.com/gin-gonic/gin"
)

type emailConfirmationRequest struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

// @Summary			Send email confirmation mail
// @Description		Send email confirmation mail
// @Accept			json
// @Produce			json
// @Param			body body emailConfirmationRequest true "Send email confirmation object"
// @Success			204 "No Content"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/send-email-confirmation [post]
func emailConfirmation(mailer *mail.Mailer) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body emailConfirmationRequest

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request", err)
			return
		}

		if err := mailer.SendEmailConfirmationMessage(body.Email, body.Token); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to send email confirmation")
			return
		}

		ctx.Status(http.StatusNoContent)
	}
}
