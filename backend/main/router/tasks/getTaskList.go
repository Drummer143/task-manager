package tasksRouter

import (
	"main/dbClient"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func getTaskListWS(db *gorm.DB, ctx *gin.Context) (map[string][]dbClient.Task, error) {
	ownerID := ctx.Query("owner_id")

	if ownerID == "" {
		session := sessions.Default(ctx)

		ownerID = session.Get("id").(uuid.UUID).String()
	}

	var tasks []dbClient.Task

	// include := ctx.Query("include")

	// if strings.Contains(include, "assignee") {
	// 	db.Preload("Assignee")
	// }

	// if strings.Contains(include, "author") {
	// 	db.Preload("Author")
	// }

	if err := db.Find(&tasks, "owner_id = ?", ownerID).Error; err != nil {
		return nil, err
	}

	var tasksGroups = make(groupedByStatusTasks)

	for _, task := range tasks {
		tasksGroups[task.Status] = append(tasksGroups[task.Status], task)
	}

	return tasksGroups, nil
}
