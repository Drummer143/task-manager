package router

import (
	"encoding/gob"
	"net/http"
	"os"

	_ "main/docs"
	"main/internal/postgres"
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
)

func setDefaultWorkspace(ctx *gin.Context) {
	userId, _ := routerUtils.GetUserIdFromSession(ctx)

	session := sessions.Default(ctx)

	selectedWorkspaceFromSession := session.Get("selected_workspace")

	if selectedWorkspaceFromSession != nil {
		return
	}

	var userMeta postgres.UserMeta

	if err := postgres.DB.Where("user_id = ?", userId).First(&userMeta).Error; err != nil {
		return
	}

	if userMeta.SelectedWorkspace != nil {
		session.Set("selected_workspace", userMeta.SelectedWorkspace)
		session.Save()
		return
	}

	var workspace postgres.Workspace

	if err := postgres.DB.Joins("JOIN workspace_accesses ON workspace_accesses.workspace_id = workspaces.id").
		Where("workspace_accesses.user_id = ? AND workspace_accesses.deleted_at IS NULL", userId).
		First(&workspace).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "Internal server error")
		return
	}

	userMeta.SelectedWorkspace = &workspace.ID

	if err := postgres.DB.Save(&userMeta).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "Internal server error")
		return
	}

	session.Set("selected_workspace", workspace.ID)
	session.Save()
}

func New(validate *validator.Validate, sockets *socketManager.SocketManager) *gin.Engine {
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

	router.GET("/socket", IsAuthenticated, handleWebSocket(sockets))

	authRouter.AddRoutes(router.Group("auth"), validate)

	workspacesRouter.AddRoutes(router.Group("workspaces", IsAuthenticated), validate, sockets)

	profileRouter.AddRoutes(router.Group("profile", IsAuthenticated, setDefaultWorkspace), validate)
	usersRouter.AddRoutes(router.Group("users", IsAuthenticated))

	return router
}
