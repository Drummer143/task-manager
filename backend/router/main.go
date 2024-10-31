package router

import (
	"encoding/gob"
	"net/http"

	"main/auth"
	_ "main/docs"
	"main/mail"

	// authRouter "main/router/auth"
	authRouter "main/router/auth"
	profileRouter "main/router/profile"
	tasksRouter "main/router/tasks"
	"main/storage"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

func New(auth *auth.Auth, storage *storage.Storage, db *gorm.DB, validate *validator.Validate, mailer *mail.Mailer) *gin.Engine {
	router := gin.Default()

	gob.Register(uuid.UUID{})

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

	authRouter.AddRoutes(router.Group("auth"), auth, validate, db, mailer)
	profileRouter.AddRoutes(router.Group("profile", IsAuthenticated(auth)), storage, validate, db)
	tasksRouter.AddRoutes(router.Group("tasks", IsAuthenticated(auth)), db, validate)

	return router
}
