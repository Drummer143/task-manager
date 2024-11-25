package tasksRouter

import (
	"main/dbClient"
)

type groupedByStatusTasks = map[string][]dbClient.Task
