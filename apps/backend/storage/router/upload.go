package router

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"storage/router/errorHandlers"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type uploadResponse struct {
	Link string `json:"link"`
}

// @Summary Upload file
// @Description Upload file
// @Tags Files
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File"
// @Param folder formData string false "Folder"
// @Success 201 {object} uploadResponse "File path"
// @Failure 400 {object} errorHandlers.Error "Bad request"
// @Failure 500 {object} errorHandlers.Error "Internal server error"
// @Router /upload [post]
func upload(ctx *gin.Context) {
	file, err := ctx.FormFile("file")

	if err != nil {
		errorHandlers.BadRequest(ctx, "no file provided", nil)
		return
	}

	fileContent, err := file.Open()

	if err != nil {
		errorHandlers.InternalServerError(ctx, "failed to handle file")
		return
	}

	defer fileContent.Close()

	folder := ctx.PostForm("folder")

	if folder == "" {
		folder = "common"
	}

	path := "./static/" + folder
	path = filepath.Clean(path)
	path = strings.ReplaceAll(path, "//", "/")
	path = strings.ReplaceAll(path, "\\\\", "\\")

	_, err = os.Stat(path)

	if os.IsNotExist(err) {
		if err := os.MkdirAll(path, os.ModePerm); err != nil {
			panic(err)
		}
	}

	filename := uuid.NewString() + filepath.Ext(file.Filename)
	path = path + "/" + filename

	out, err := os.Create(path)

	if err != nil {
		errorHandlers.InternalServerError(ctx, "failed to save file")
		return
	}

	defer out.Close()

	_, err = io.Copy(out, fileContent)

	if err != nil {
		errorHandlers.InternalServerError(ctx, "failed to save file")
		return
	}

	scheme := "http"
	if ctx.Request.TLS != nil {
		scheme = "https"
	}

	host := os.Getenv("SELF_HOST") + ":" + os.Getenv("SELF_PORT")

	if host == "" {
		host = "localhost:8082"
	}

	link := fmt.Sprintf("%s://%s/files/%s/%s", scheme, host, folder, filename)

	ctx.JSON(http.StatusCreated, uploadResponse{Link: link})
}
