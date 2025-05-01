package zitadel

import (
	"fmt"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"os"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

var JWKS *keyfunc.JWKS

var (
	zitadelIssuer    string
	expectedAudience string
	zitadelOauthPath string
)

func init() {
	zitadelIssuer = os.Getenv("ZITADEL_ISSUER_URL")
	expectedAudience = os.Getenv("ZITADEL_CLIENT_ID")
	zitadelOauthPath = os.Getenv("ZITADEL_OAUTH_PATH")

	if zitadelIssuer == "" {
		panic("ZITADEL_ISSUER_URL is not set")
	}

	if expectedAudience == "" {
		panic("ZITADEL_CLIENT_ID is not set")
	}

	if zitadelOauthPath == "" {
		panic("ZITADEL_OAUTH_PATH is not set")
	}

	jwksURL := zitadelIssuer + zitadelOauthPath + "/keys"

	var err error

	JWKS, err = keyfunc.Get(jwksURL, keyfunc.Options{
		RefreshInterval: time.Hour,
		RefreshErrorHandler: func(err error) {
			fmt.Printf("Error updating JWKs: %v\n", err)
		},
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to get JWKS from ZITADEL: %v", err))
	}
}

func AuthMiddleware(ctx *gin.Context) {
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		errorHandlers.Unauthorized(ctx, "1")
		ctx.Abort()
		return
	}

	var tokenStr string
	fmt.Sscanf(authHeader, "Bearer %s", &tokenStr)

	token, err := jwt.Parse(tokenStr, JWKS.Keyfunc)
	if err != nil || !token.Valid {
		errorHandlers.Unauthorized(ctx, "2")
		ctx.Abort()
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		errorHandlers.Unauthorized(ctx, "3")
		ctx.Abort()
		return
	}

	if iss, ok := claims["iss"].(string); !ok || iss != zitadelIssuer {
		errorHandlers.Unauthorized(ctx, "4")
		ctx.Abort()
		return
	}

	aud := claims["aud"]
	switch v := aud.(type) {
	case string:
		if v != expectedAudience {
			errorHandlers.Unauthorized(ctx, "5")
			ctx.Abort()
			return
		}
	case []interface{}:
		found := false
		for _, a := range v {
			if a == expectedAudience {
				found = true
				break
			}
		}
		if !found {
			errorHandlers.Unauthorized(ctx, "6")
			ctx.Abort()
			return
		}
	default:
		errorHandlers.Unauthorized(ctx, "7")
		ctx.Abort()
		return
	}

	var user postgres.User

	postgres.DB.Where("zitadel_user_id = ?", claims["sub"]).First(&user)

	if user.ID != uuid.Nil {
		ctx.Set("user", user)
	}

	ctx.Next()
}
