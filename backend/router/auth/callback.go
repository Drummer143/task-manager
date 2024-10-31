package authRouter

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"main/apiClient"
	"main/auth"
	"main/dbClient"
	"main/router/errorHandlers"
)

// @Summary			OAuth Callback
// @Description		This endpoint handles the OAuth 2.0 callback after the user authenticates with the external identity provider. It exchanges the authorization code for an access token and ID token, verifies the ID token, and stores the access token and user profile in the session. If the state parameter is invalid or any other error occurs during the process, appropriate error messages are returned.
// @Tags			Authentication
// @Accept			json
// @Produce			json
// @Param			state   query   string  true  "OAuth state parameter"
// @Param			code    query   string  true  "OAuth authorization code"
// @Success			307     							 "Redirect to the home page after successful login"
// @Failure			400     {object} errorHandlers.Error "Invalid state parameter"
// @Failure			401     {object} errorHandlers.Error "Failed to exchange authorization code for a token"
// @Failure			500     {object} errorHandlers.Error "Internal server error during ID token verification or session saving"
// @Router			/auth/callback [get]
func callback(auth *auth.Auth, auth0api *apiClient.ApiClient, db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)
		if ctx.Query("state") != session.Get("state") {
			errorHandlers.BadRequest(ctx, "Invalid state parameter.", nil)
			return
		}

		token, err := auth.Exchange(ctx.Request.Context(), ctx.Query("code"))
		if err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to exchange authorization code for a token.")
			return
		}

		idToken, err := auth.VerifyIDToken(ctx.Request.Context(), token)
		if err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to verify ID Token.")
			return
		}

		var profile map[string]interface{}
		if err := idToken.Claims(&profile); err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to parse ID Token.")
			return
		}

		session.Set("access_token", token.AccessToken)
		session.Set("profile", profile)

		err = session.Save()

		if err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to save session.")
			return
		}

		var dbUser dbClient.User
		var userId = profile["sub"].(string)

		err = db.First(&dbUser, "user_id = ?", userId).Error

		if err == gorm.ErrRecordNotFound {
			var auth0user apiClient.User

			_, err := auth0api.Get("/api/v2/users/"+userId, nil, &auth0user)

			if err != nil {
				errorHandlers.InternalServerError(ctx, "Failed to get user from Auth0.")
				return
			}

			dbUser = dbClient.User{
				CreatedAt:         auth0user.CreatedAt,
				Email:             auth0user.Email,
				EmailVerified:     auth0user.EmailVerified,
				Name:              auth0user.Name,
				Nickname:          auth0user.Nickname,
				Picture:           &auth0user.Picture,
				UpdatedAt:         auth0user.UpdatedAt,
				UserID:            auth0user.UserID,
				Username:          auth0user.Username,
				LastPasswordReset: &auth0user.LastPasswordReset,
				LastIP:            auth0user.LastIP,
				LastLogin:         auth0user.LastLogin,
				LoginsCount:       auth0user.LoginsCount,
			}

			if err := db.Create(&dbUser).Error; err != nil {
				errorHandlers.InternalServerError(ctx, "Failed to create user in database.")
				return
			}
		} else if err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to get user from database.")
			return
		}

		ctx.Redirect(http.StatusTemporaryRedirect, "http://localhost:5173/profile")
	}
}
