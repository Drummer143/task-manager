package router

import (
	"encoding/gob"
	"net/http"
	"os"

	"main/auth"
	"main/dbClient"
	_ "main/docs"
	authRouter "main/router/auth"
	"main/router/errorHandlers"
	profileRouter "main/router/profile"
	usersRouter "main/router/users"
	routerUtils "main/router/utils"
	workspacesRouter "main/router/workspaces"
	"main/socketManager"

	// authRouter "main/router/auth"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

func setDefaultWorkspace(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		session := sessions.Default(ctx)

		selectedWorkspaceFromSession := session.Get("selected_workspace")

		if selectedWorkspaceFromSession != nil {
			return
		}

		var userMeta dbClient.UserMeta

		if err := postgres.Where("user_id = ?", userId).First(&userMeta).Error; err != nil {
			return
		}

		if userMeta.SelectedWorkspace != nil {
			session.Set("selected_workspace", userMeta.SelectedWorkspace)
			session.Save()
			return
		}

		var workspace dbClient.Workspace

		if err := postgres.Joins("JOIN workspace_accesses ON workspace_accesses.workspace_id = workspaces.id").
			Where("workspace_accesses.user_id = ? AND workspace_accesses.deleted_at IS NULL", userId).
			First(&workspace).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Internal server error")
			return
		}

		userMeta.SelectedWorkspace = &workspace.ID

		if err := postgres.Save(&userMeta).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Internal server error")
			return
		}

		session.Set("selected_workspace", workspace.ID)
		session.Save()
	}
}

func New(auth *auth.Auth, postgres *gorm.DB, mongo *mongo.Client, validate *validator.Validate, sockets *socketManager.SocketManager) *gin.Engine {
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
		AllowHeaders:     []string{"Content-Type", "Origin", "Accept"},
		MaxAge:           3600,
		AllowCredentials: true,
	}))

	router.GET("/api/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/api", func(ctx *gin.Context) { ctx.Redirect(http.StatusMovedPermanently, "/api/index.html") })

	router.GET("/socket", IsAuthenticated(auth), handleWebSocket(sockets))

	authRouter.AddRoutes(router.Group("auth"), auth, validate, postgres)

	workspacesRouter.AddRoutes(router.Group("workspaces", IsAuthenticated(auth)), postgres, mongo, validate, sockets)

	profileRouter.AddRoutes(router.Group("profile", IsAuthenticated(auth), setDefaultWorkspace(postgres)), validate, postgres)
	usersRouter.AddRoutes(router.Group("users", IsAuthenticated(auth)), postgres)

	return router
}
