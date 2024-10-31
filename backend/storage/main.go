package storage

import (
	"context"
	"io"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type Storage struct {
	cld *cloudinary.Cloudinary
}

func New() (*Storage, error) {
	cld, err := cloudinary.New()
	if err != nil {
		return nil, err
	}
	cld.Config.URL.Secure = true
	return &Storage{cld: cld}, nil
}

func (is *Storage) Upload(name string, file io.Reader, ctx context.Context) (string, error) {
	resp, err := is.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:       name,
		UniqueFilename: api.Bool(false),
		Overwrite:      api.Bool(true),
	})

	if err != nil {
		return "", err
	}
	return resp.URL, nil
}
