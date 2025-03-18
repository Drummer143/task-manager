package dbClient

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Change struct {
	From any `json:"from"`
	To   any `json:"to"`
}

type ShortUserInfo struct {
	Id      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Picture *string   `json:"picture,omitempty"`
}

type EntityVersionDocument struct {
	Version   int               `json:"version"`
	Id        uuid.UUID         `json:"id"`
	Changes   map[string]Change `json:"changes"`
	Author    ShortUserInfo     `json:"user"`
	CreatedAt time.Time         `gorm:"default:current_timestamp" json:"created_at"`
}

func initPostgres() (*gorm.DB, error) {
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB_NAME")
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	sllMode := os.Getenv("POSTGRES_SSL_MODE")

	dsn := "host=" + host + " user=" + user + " password=" + password + " dbname=" + dbName + " port=" + port + " sslmode=" + sllMode

	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

func initMongo() (*mongo.Client, error) {
	mongoURL := os.Getenv("MONGO_URL")

	clientOptions := options.Client().ApplyURI(mongoURL)

	return mongo.Connect(context.Background(), clientOptions)
}

func New() (*gorm.DB, *mongo.Client, error) {
	postgres, err := initPostgres()

	if err != nil {
		return nil, nil, err
	}

	mongoClient, err := initMongo()

	return postgres, mongoClient, err
}

func MigratePostgres() error {
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB_NAME")
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	sslMode := os.Getenv("POSTGRES_SSL_MODE")

	dbUrl := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, dbName, sslMode)

	m, err := migrate.New("file://migrations", dbUrl)

	if err != nil {
		return err
	}

	err = m.Up()

	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	return nil
}
