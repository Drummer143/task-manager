package profileRouter

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/draw"
	"image/jpeg"
	"image/png"
	"main/dbClient"
	"main/router/errorHandlers"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func convertFormDataToImage(file *multipart.FileHeader) (image.Image, string, error) {
	fileContent, err := file.Open()

	if err != nil {
		return nil, "", fmt.Errorf("failed to open file")
	}

	defer fileContent.Close()

	img, ext, err := image.Decode(fileContent)

	if err != nil {
		return nil, "", fmt.Errorf("failed to decode image")
	}

	return img, ext, nil
}

func validateImageSizes(ctx *gin.Context, imageWidth int, imageHeight int) (int, int, int, int, error) {
	imageSizes := map[string]string{
		"x": ctx.PostForm("x"),
		"y": ctx.PostForm("y"),
		"w": ctx.PostForm("width"),
		"h": ctx.PostForm("height"),
	}

	var x, y, w, h int

	for k, v := range imageSizes {
		if v == "" {
			return -1, -1, -1, -1, fmt.Errorf("missing parameter: %s", k)
		}

		i, err := strconv.Atoi(v)

		if err != nil {
			return -1, -1, -1, -1, fmt.Errorf("failed to parse parameter: %s", k)
		}

		if i < 0 {
			return -1, -1, -1, -1, fmt.Errorf("area parameter must be greater than 0: %s", k)
		}

		switch k {
		case "x":
			x = i
		case "y":
			y = i
		case "w":
			w = i
		case "h":
			h = i
		}
	}

	if x+w > imageWidth || y+h > imageHeight {
		return -1, -1, -1, -1, fmt.Errorf("crop area exceeds image width or height")
	}

	return x, y, w, h, nil
}

// @Summary			Upload user avatar
// @Description		This endpoint uploads the user avatar image to the image storage service and updates the user profile information in the Auth0 Management API using the user's ID from the session. The ID is obtained from the session and used to query the user data from the external identity provider (Auth0). The user must be authenticated, and a valid session must exist. The request body must contain a valid image file.
// @Tags			Profile
// @Accept			multipart/form-data
// @Produce			json
// @Param			file formData file true "User avatar image file"
// @Param			x formData string true "X coordinate of the crop area"
// @Param			y formData string true "Y coordinate of the crop area"
// @Param			width formData string true "Width of the crop area"
// @Param			height formData string true "Height of the crop area"
// @Success			200 {object} dbClient.User "User profile data"
// @Failure			400 {object} errorHandlers.Error "Invalid request"
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure			404 {object} errorHandlers.Error "User not found in Auth0 database"
// @Failure			429 {object} errorHandlers.Error "Rate limit exceeded"
// @Failure			500 {object} errorHandlers.Error "Internal server error if request to Auth0 fails"
// @Router			/profile/avatar [patch]
func uploadAvatar(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		var user dbClient.User

		if err := postgres.First(&user, "id = ?", userId).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				errorHandlers.NotFound(ctx, "user not found in database")
				return
			} else {
				errorHandlers.InternalServerError(ctx, "failed to find user in database")
				return
			}
		}

		storageUrl := os.Getenv("STORAGE_URL")

		if storageUrl == "" {
			errorHandlers.InternalServerError(ctx, "unable to update user profile picture")
			return
		}

		file, err := ctx.FormFile("file")

		if err != nil {
			errorHandlers.BadRequest(ctx, "request must contain a file", map[string]string{"file": "file is required"})
			return
		}

		img, ext, err := convertFormDataToImage(file)

		if err != nil {
			errorHandlers.InternalServerError(ctx, err.Error())
			return
		}

		if ext != "jpg" && ext != "jpeg" && ext != "png" {
			errorHandlers.BadRequest(ctx, "invalid file type", map[string]string{"file": "invalid file type. Only jpg, jpeg, and png are supported."})
			return
		}

		imageWidth := img.Bounds().Dx()
		imageHeight := img.Bounds().Dy()

		x, y, width, height, err := validateImageSizes(ctx, imageWidth, imageHeight)

		if err != nil {
			errorHandlers.BadRequest(ctx, "failed to validate image sizes", map[string]string{"file": err.Error()})
			return
		}

		croppedImage := image.NewRGBA(image.Rect(x, y, x+width, y+height))

		draw.Draw(croppedImage, croppedImage.Bounds(), img, image.Point{x, y}, draw.Src)

		var buffer bytes.Buffer

		switch ext {
		case "jpg", "jpeg":
			err = jpeg.Encode(&buffer, croppedImage, nil)
		case "png":
			err = png.Encode(&buffer, croppedImage)
		default:
			errorHandlers.BadRequest(ctx, "invalid file type", map[string]string{"file": "invalid file type"})
			return
		}

		if err != nil {
			errorHandlers.InternalServerError(ctx, "failed to encode image")
			return
		}

		resp, err := resty.New().R().SetHeader("Content-Type", "multipart/form-data").SetFileReader("file", file.Filename, &buffer).SetFormData(map[string]string{
			"folder": "avatars",
		}).Post(storageUrl + "/upload")

		if resp.StatusCode() > 299 || err != nil {
			errorHandlers.InternalServerError(ctx, "failed to upload file to storage")
			return
		}

		var body map[string]interface{}

		if err := json.Unmarshal(resp.Body(), &body); err != nil {
			errorHandlers.InternalServerError(ctx, "failed to upload file to storage")
			return
		}

		link := body["link"].(string)

		user.Picture = &link
		user.UpdatedAt = time.Now()

		if err := postgres.Save(&user).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to update user in database")
			return
		}

		ctx.JSON(http.StatusOK, user)
	}
}
