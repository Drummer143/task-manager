package authRouter

import (
	"main/apiClient"
	"main/auth"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddRoutes(group *gin.RouterGroup, auth *auth.Auth, auth0api *apiClient.ApiClient, db *gorm.DB) {
	group.GET("/login", login(auth))
	group.GET("/callback", callback(auth, auth0api, db))
	group.GET("/logout", logout)
}
