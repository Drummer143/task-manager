package main

import (
	"main/cleanup"
	_ "main/internal/mongo"
	"main/internal/postgres"
	"main/router"

	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()

	if err != nil {
		panic(err)
	}
}

func main() {
	if err := postgres.MigratePostgres(); err != nil {
		panic(err)
	}

	if err := cleanup.Setup(); err != nil {
		panic(err)
	}

	r := router.New()

	r.Run(":8080")
}
