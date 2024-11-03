package main

import (
	"main/auth"
	"main/dbClient"
	"main/router"
	"main/validation"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		panic(err)
	}

	DB, err := dbClient.New()

	if err != nil {
		panic(err)
	}

	err = dbClient.Migrate()

	if err != nil {
		panic(err)
	}

	auth, err := auth.New()

	if err != nil {
		panic(err)
	}

	validate := validation.New()

	r := router.New(auth, DB, validate)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Run(":8080")
}
