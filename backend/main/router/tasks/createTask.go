package tasksRouter

import (
	"encoding/json"
	"main/dbClient"
	"main/validation"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type createTaskBody struct {
	DeletableNotByOwner bool       `json:"deletableNotByOwner"`
	Status              string `json:"status" validate:"required"`
	Title               string     `json:"title" validate:"required,max=63"`
	Description         *string    `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate             *string    `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssignedTo          *uuid.UUID `json:"assignedTo,omitempty" validate:"omitempty,uuid4"`
}

func createTaskWS(ctx *gin.Context, req []byte, db *gorm.DB, validate *validator.Validate) (task *dbClient.Task, validationError map[string]string, err error) {
	var body createTaskBody

	if err := json.Unmarshal(req, &body); err != nil {
		return nil, nil, err
	}

	if err = validate.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			return nil, errors, nil
		}

		return nil, nil, err
	}

	session := sessions.Default(ctx)

	userId, _ := session.Get("id").(uuid.UUID)

	task = &dbClient.Task{
		DeletableNotByOwner: body.DeletableNotByOwner,
		Status:              body.Status,
		Title:               body.Title,
		Description:         body.Description,
		DueDate:             body.DueDate,
		AssignedTo:          body.AssignedTo,
		OwnerID:             userId,
	}

	if err = db.Create(&task).Error; err != nil {
		return nil, nil, err
	}

	return task, nil, nil
}
