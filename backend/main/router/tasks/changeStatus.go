package tasksRouter

import (
	"encoding/json"
	"fmt"
	"main/dbClient"
	"main/validation"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type updateStatusResponse struct {
	Task       dbClient.Task `json:"task"`
	PrevStatus string        `json:"prevStatus"`
}

type changeTaskStatusBody struct {
	Status string    `json:"status" validate:"required"`
	Id     uuid.UUID `json:"id" validate:"required,uuid4"`
}

func changeStatusWS(db *gorm.DB, req []byte, validate *validator.Validate) (*updateStatusResponse, map[string]string, error) {
	var body changeTaskStatusBody

	if err := json.Unmarshal(req, &body); err != nil {
		return nil, nil, err
	}

	if err := validate.Var(body, "required,oneof=not_done in_progress done"); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			return nil, errors, nil
		}

		return nil, nil, err
	}

	var task dbClient.Task

	if err := db.First(&task, "id = ?", body.Id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil, fmt.Errorf("task not found")
		} else {
			return nil, nil, fmt.Errorf("failed to get task")
		}
	}

	prevStatus := task.Status
	task.Status = body.Status

	if err := db.Save(&task).Error; err != nil {
		return nil, nil, err
	}

	return &updateStatusResponse{Task: task, PrevStatus: prevStatus}, nil, nil
}
