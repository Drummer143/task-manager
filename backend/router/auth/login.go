package authRouter

import (
	"crypto/rand"
	"encoding/base64"
	"main/auth"
	"main/router/errorHandlers"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func generateRandomState() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	state := base64.StdEncoding.EncodeToString(b)

	return state, nil
}

// @Summary			OAuth Login
// @Description		This endpoint initiates the OAuth 2.0 login process. It generates a random state parameter for security, saves it to the user's session, and redirects the user to the external identity provider's authorization page. The state parameter is used to prevent CSRF attacks.
// @Tags			Authentication
// @Produce			json
// @Success			307     							 "Redirect to the external identity provider's authorization page"
// @Failure			500     {object} errorHandlers.Error "Internal server error if random state generation or session saving fails"
// @Router			/auth/login [get]
func login(auth *auth.Auth) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		state, err := generateRandomState()
		if err != nil {
			errorHandlers.InternalServerError(ctx, err.Error())
			return
		}

		// Save the state inside the session.
		session := sessions.Default(ctx)
		session.Set("state", state)

		err = session.Save()

		if err != nil {
			errorHandlers.InternalServerError(ctx, err.Error())
			return
		}

		ctx.Redirect(http.StatusTemporaryRedirect, auth.AuthCodeURL(state))
	}
}
