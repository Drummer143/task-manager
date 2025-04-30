package router

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"net/http"

	"mailer/mail"

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
func emailConfirmation(ctx *gin.Context) {
	var body emailConfirmationRequest

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	if err := mail.SendEmailConfirmationMessage(body.Email, body.Token); err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	ctx.Status(http.StatusNoContent)
}
