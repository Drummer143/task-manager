package tasksRouter

import (
	"main/dbClient"

	"github.com/google/uuid"
)

type updateTaskBody struct {
	DeletableNotByOwner *bool      `json:"deletableNotByOwner,omitempty" validate:"omitempty"`
	Status              *string    `json:"status,omitempty" validate:"omitempty,oneof=not_done in_progress done"`
	Title               *string    `json:"title,omitempty" validate:"omitempty,max=63"`
	Description         *string    `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate             *string    `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssignedTo          *uuid.UUID `json:"assignedTo,omitempty" validate:"omitempty,uuid4"`
}

type groupedByStatusTasks = map[string][]dbClient.Task
