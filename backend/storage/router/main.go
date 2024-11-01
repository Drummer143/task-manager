package router

import (
	"net/http"
	_ "storage/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func New() *gin.Engine {
	router := gin.Default()

	router.Static("/files", "./static")

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.GET("/api", func(ctx *gin.Context) { ctx.Redirect(http.StatusFound, "/swagger/index.html") })

	router.POST("/upload", upload)

	return router
}
