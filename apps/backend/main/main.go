package main

import (
	"main/auth"
	"main/cleanup"
	"main/dbClient"
	"main/router"
	"main/socketManager"
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

	if err = dbClient.MigratePostgres(); err != nil {
		panic(err)
	}

	auth, err := auth.New()

	if err != nil {
		panic(err)
	}

	validate := validation.New()

	sockets := socketManager.NewSubscriptionManager()

	cleanup.Setup(postgresDB)

	r := router.New(auth, postgresDB, mongoDB, validate, sockets)

	r.Run(":8080")
}