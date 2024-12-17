package tasksRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type createTaskBody struct {
	PageId              uuid.UUID  `json:"pageId" validate:"required,uuid4"`
	DeletableNotByOwner bool       `json:"deletableNotByOwner"`
	Status              taskStatus `json:"status" validate:"required"`
	Title               string     `json:"title" validate:"required,max=63"`
	Description         *string    `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate             *time.Time `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssignedTo          *uuid.UUID `json:"assignedTo,omitempty" validate:"omitempty,uuid4"`
}

// CreateTask 		creates a new task
// @Summary 		Create a new task
// @Description		Create a new task
// @Tags			Tasks
// @Accept 			json
// @Produce 		json
// @Param 			task body createTaskBody true "Task object that needs to be created"
// @Success 		201 {object} dbClient.Task
// @Failure 		400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/tasks [post]
func createTask(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body createTaskBody

		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		if err := validate.Struct(body); err != nil {
			if errors, ok := validation.ParseValidationError(err); ok {
				errorHandlers.BadRequest(ctx, "invalid request body", errors)
				return
			}

			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		session := sessions.Default(ctx)

		userId, _ := session.Get("id").(uuid.UUID)

		var task dbClient.Task = dbClient.Task{
			DeletableNotByOwner: body.DeletableNotByOwner,
			Status:              body.Status,
			Title:               body.Title,
			Description:         body.Description,
			DueDate:             body.DueDate,
			AssignedTo:          body.AssignedTo,
			PageID:              body.PageId,
			OwnerID:             userId,
		}

		if err := db.Create(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create task")
			return
		}

		ctx.JSON(http.StatusCreated, task)
	}
}
