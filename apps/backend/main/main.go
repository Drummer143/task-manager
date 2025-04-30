package main

import (
	"main/cleanup"
	_ "main/internal/mongo"
	"main/internal/postgres"
	"main/router"
	"main/validation"

	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()

	if err != nil {
		panic(err)
	}
}

func main() {
	validate := validation.New()

	if err := postgres.MigratePostgres(); err != nil {
		panic(err)
	}

	cleanup.Setup()

	r := router.New(validate)

	r.Run(":8080")
}
