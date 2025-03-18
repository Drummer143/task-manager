package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Auth struct {
	secretKey []byte
}

func New() (*Auth, error) {
	secretKey := os.Getenv("JWT_SECRET_KEY")

	if secretKey == "" {
		return nil, errors.New("JWT_SECRET_KEY is not set")
	}

	return &Auth{
		secretKey: []byte(secretKey),
	}, nil
}

func (a *Auth) GenerateJWT(email string, expiration time.Duration) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":  email,
		"exp": time.Now().Add(expiration).Unix(),
	})

	return token.SignedString(a.secretKey)
}

func (a *Auth) ValidateJWT(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return a.secretKey, nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, err
}
