package main

import (
	"fileStorage/router"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}

	_, err := os.Stat("./static")

	if os.IsNotExist(err) {
		if err := os.Mkdir("./static", os.ModePerm); err != nil {
			panic(err)
		}
	}

	port := os.Getenv("PORT")

	if port == "" {
		panic("port is not set")
	}

	app := router.New()

	app.Run(":" + port)
}