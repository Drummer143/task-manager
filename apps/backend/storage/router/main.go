package router

import (
	"net/http"
	"os"
	_ "storage/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func New() *gin.Engine {
	ginModeEnv := os.Getenv("GIN_MODE")

	if ginModeEnv == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	router.Static("/files", "./static")

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/api", func(ctx *gin.Context) { ctx.Redirect(http.StatusFound, "/swagger/index.html") })

	router.POST("/upload", upload)

	return router
}
