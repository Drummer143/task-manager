package zitadel

import (
	"encoding/json"
	"os"

	"github.com/go-resty/resty/v2"
)

var zitadelUserPath = "/v2/users/"
var zitadelAccessToken = os.Getenv("ZITADEL_ACCESS_TOKEN")

func GetUserById(id string) (*UserResponse, error) {
	restyClient := resty.New().SetAuthToken(zitadelAccessToken).SetAuthScheme("Bearer").SetHeader("Accept", "application/json")

	resp, err := restyClient.R().Get(zitadelIssuer + zitadelUserPath + id)

	if err != nil || resp.StatusCode() > 299 {
		return nil, err
	}

	var user UserResponse

	if err := json.Unmarshal(resp.Body(), &user); err != nil {
		return nil, err
	}

	return &user, nil
}
