package main

import (
	"mailer/mail"
	"mailer/router"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	port := os.Getenv("SELF_PORT")

	if port == "" {
		panic("SELF_PORT must be set")
	}

	mailer := mail.New()

	router := router.New(mailer)

	router.Run(":" + port)
}
