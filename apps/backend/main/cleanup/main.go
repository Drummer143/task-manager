package cleanup

import (
	"main/internal/postgres"
	"time"

	"github.com/robfig/cron/v3"
)

func deleteWorkspaces() {
	cutoff := time.Now()

	postgres.DB.Where("deleted_at < ?", cutoff).Delete(&postgres.Workspace{})
}

func Setup() error {
	c := cron.New()

	_, err := c.AddFunc("0 0 * * *", deleteWorkspaces)

	if err != nil {
		return err
	}

	return nil
}
