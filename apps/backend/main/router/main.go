package router

import (
	"encoding/gob"
	"net/http"
	"os"

	_ "main/docs"
	"main/internal/zitadel"
	authRouter "main/router/auth"
	profileRouter "main/router/profile"
	workspacesRouter "main/router/workspaces"

	// authRouter "main/router/auth"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func New() *gin.Engine {
	ginModeEnv := os.Getenv("GIN_MODE")

	if ginModeEnv == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	gob.Register(uuid.UUID{})

	store := cookie.NewStore([]byte("secret"))
	router.Use(sessions.Sessions("auth-session", store))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:1346", "http://localhost:1246"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Origin", "Accept", "Authorization"},
		MaxAge:           3600,
		AllowCredentials: true,
	}))

	router.GET("/api/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/api", func(ctx *gin.Context) { ctx.Redirect(http.StatusMovedPermanently, "/api/index.html") })

	router.GET("/socket", zitadel.AuthMiddleware, handleWebSocket)

	authRouter.AddRoutes(router.Group("auth"))

	workspacesRouter.AddRoutes(router.Group("workspaces", zitadel.AuthMiddleware))

	profileRouter.AddRoutes(router.Group("profile", zitadel.AuthMiddleware /* , setDefaultWorkspace */))

	return router
}
