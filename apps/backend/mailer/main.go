package main

import (
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

	router := router.New()

	router.Run(":" + port)
}
