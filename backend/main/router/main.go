package router

import (
	"encoding/gob"
	"net/http"
	"os"

	"main/auth"
	_ "main/docs"

	// authRouter "main/router/auth"
	authRouter "main/router/auth"
	boardsRouter "main/router/boards"
	profileRouter "main/router/profile"
	tasksRouter "main/router/tasks"

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

func New(auth *auth.Auth, db *gorm.DB, validate *validator.Validate) *gin.Engine {
	ginModeEnv := os.Getenv("GIN_MODE")

	if ginModeEnv == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	gob.Register(uuid.UUID{})

	store := cookie.NewStore([]byte("secret"))
	router.Use(sessions.Sessions("auth-session", store))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4173", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Origin", "Accept"},
		MaxAge:           3600,
		AllowCredentials: true,
	}))

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/api", func(ctx *gin.Context) { ctx.Redirect(http.StatusFound, "/swagger/index.html") })

	authRouter.AddRoutes(router.Group("auth"), auth, validate, db)
	profileRouter.AddRoutes(router.Group("profile", IsAuthenticated(auth)), validate, db)
	tasksRouter.AddRoutes(router.Group("tasks", IsAuthenticated(auth)), db, validate)
	boardsRouter.AddRoutes(router.Group("boards", IsAuthenticated(auth)), db, validate)

	return router
}
