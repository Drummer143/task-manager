package router

import (
	"encoding/gob"
	"net/http"

	"main/apiClient"
	"main/auth"
	_ "main/docs"
	authRouter "main/router/auth"
	profileRouter "main/router/profile"
	tasksRouter "main/router/tasks"
	"main/storage"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

func New(auth *auth.Auth, storage *storage.Storage, auth0Api *apiClient.ApiClient, db *gorm.DB, validate *validator.Validate) *gin.Engine {
	router := gin.Default()

	gob.Register(map[string]interface{}{})

	store := cookie.NewStore([]byte("secret"))
	router.Use(sessions.Sessions("auth-session", store))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/api", func(ctx *gin.Context) { ctx.Redirect(http.StatusFound, "/swagger/index.html") })

	authRouter.AddRoutes(router.Group("auth"), auth, auth0Api, db)
	profileRouter.AddRoutes(router.Group("profile", IsAuthenticated), storage, validate, db)
	tasksRouter.AddRoutes(router.Group("tasks", IsAuthenticated), db, validate)

	return router
}
