package mongo

import (
	"context"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Client

func init() {
	mongoURL := os.Getenv("MONGO_URL")

	clientOptions := options.Client().ApplyURI(mongoURL)

	mongoDB, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		panic(err)
	}

	DB = mongoDB
}
