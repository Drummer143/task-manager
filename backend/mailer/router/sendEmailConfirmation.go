package router

import (
	"net/http"

	"mailer/mail"
	"mailer/router/errorHandlers"

	"github.com/gin-gonic/gin"
)

type SendEmailConfirmationRequest struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

type SendEmailConfirmationResponse struct {
	Message string `json:"message"`
}

// @Summary			Send email confirmation mail
// @Description		Send email confirmation mail
// @Accept			json
// @Produce			json
// @Param			body body SendEmailConfirmationRequest true "Send email confirmation object"
// @Success			200 {object} SendEmailConfirmationResponse "Email confirmation sent"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			500 {object} errorHandlers.Error "Internal server error if server fails"
// @Router			/sendEmailConfirmation [post]
func sendEmailConfirmation(mailer *mail.Mailer) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body SendEmailConfirmationRequest

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request", err)
			return
		}

		if err := mailer.SendEmailConfirmationMessage(body.Email, body.Token); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to send email confirmation")
			return
		}

		ctx.JSON(http.StatusOK, SendEmailConfirmationResponse{Message: "Email confirmation sent"})
	}
}
