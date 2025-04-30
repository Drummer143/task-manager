package main

import (
	"main/cleanup"
	"main/dbClient"
	"main/router"
	"main/socketManager"
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
	postgresDB, mongoDB, err := dbClient.New()

	if err != nil {
		panic(err)
	}

	if err = dbClient.MigratePostgres(); err != nil {
		panic(err)
	}

	validate := validation.New()

	sockets := socketManager.NewSubscriptionManager()

	cleanup.Setup(postgresDB)

	r := router.New(postgresDB, mongoDB, validate, sockets)

	r.Run(":8080")
}
