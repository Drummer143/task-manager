package authRouter

import (
	"main/router/errorHandlers"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// @Summary			OAuth Logout
// @Description		This endpoint logs the user out of the application. It clears the session and redirects the user to the Auth0 logout page, which will then redirect the user back to the application after a successful logout.
// @Tags			Authentication
// @Produce			json
// @Success			307     							 "Redirect to the Auth0 logout page"
// @Failure			500     {object} errorHandlers.Error "Internal server error if URL parsing fails"
// @Router			/auth/logout [get]
func logout(ctx *gin.Context) {
	session := sessions.Default(ctx)

	session.Clear()

	err := session.Save()
	if err != nil {
		errorHandlers.InternalServerError(ctx, err.Error())
		return
	}

	logoutUrl, err := url.Parse("https://" + os.Getenv("AUTH0_DOMAIN") + "/v2/logout")
	if err != nil {
		errorHandlers.InternalServerError(ctx, err.Error())
		return
	}

	returnTo := "http://localhost:3000"

	parameters := url.Values{}
	parameters.Add("returnTo", returnTo)
	parameters.Add("client_id", os.Getenv("AUTH0_CLIENT_ID"))
	logoutUrl.RawQuery = parameters.Encode()

	ctx.Redirect(http.StatusTemporaryRedirect, returnTo)
}
