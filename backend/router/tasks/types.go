package tasksRouter

import (
	"main/dbClient"
)

type taskStatus = string

var (
	NotDone    taskStatus = "not_done"
	InProgress taskStatus = "in_progress"
	Done       taskStatus = "done"
)

type createTaskBody struct {
	DeletableNotByOwner bool       `json:"deletableNotByOwner"`
	Status              taskStatus `json:"status" validate:"required"`
	Title               string     `json:"title" validate:"required,max=63"`
	Description         *string    `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate             *string    `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssignedTo          *string    `json:"assignedTo,omitempty" validate:"omitempty,uuid4"`
}

type updateTaskBody struct {
	DeletableNotByOwner *bool       `json:"deletableNotByOwner,omitempty" validate:"omitempty"`
	Status              *taskStatus `json:"status,omitempty" validate:"omitempty,oneof=not_done in_progress done"`
	Title               *string     `json:"title,omitempty" validate:"omitempty,max=63"`
	Description         *string     `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate             *string     `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssignedTo          *string     `json:"assignedTo,omitempty" validate:"omitempty,uuid4"`
}

type changeTaskStatusBody struct {
	Status taskStatus `json:"status" validate:"required,oneof=not_done in_progress done"`
}

type groupedByStatusTasks = map[taskStatus][]dbClient.Task
