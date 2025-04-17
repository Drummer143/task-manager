package cleanup

import (
	"main/dbClient"
	"time"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
)

func deleteWorkspaces(postgres *gorm.DB) {
	cutoff := time.Now()

	postgres.Where("deleted_at < ?", cutoff).Delete(&dbClient.Workspace{})
}

func Setup(postgres *gorm.DB) error {
	c := cron.New()

	_, err := c.AddFunc("0 0 * * *", func() {
		deleteWorkspaces(postgres)
	})

	if err != nil {
		return err
	}

	return nil
}