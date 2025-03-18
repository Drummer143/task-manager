package main

import (
	"main/auth"
	"main/dbClient"
	"main/router"
	"main/validation"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		panic(err)
	}

	postgresDB, mongoDB, err := dbClient.New()

	if err != nil {
		panic(err)
	}

	err = dbClient.MigratePostgres()

	if err != nil {
		panic(err)
	}

	auth, err := auth.New()

	if err != nil {
		panic(err)
	}

	validate := validation.New()

	r := router.New(auth, postgresDB, mongoDB, validate)

	r.Run(":8080")
}
