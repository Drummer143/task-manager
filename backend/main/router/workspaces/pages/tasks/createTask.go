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
	Status      taskStatus `json:"status" validate:"required"`
	Title       string     `json:"title" validate:"required,max=63"`
	Description *string    `json:"description,omitempty" validate:"omitempty,max=255"`
	DueDate     *string    `json:"dueDate,omitempty" validate:"omitempty,iso8601"`
	AssigneeID  *uuid.UUID `json:"assigneeID,omitempty" validate:"omitempty,uuid4"`
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
// @Router 			/workspaces/{workspace_id}/pages/{page_id}/tasks [post]
func createTask(postgres *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
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
			Status:      body.Status,
			Title:       body.Title,
			Description: body.Description,
			AssigneeID:  body.AssigneeID,
			PageID:      uuid.MustParse(ctx.Param("page_id")),
			ReporterID:  userId,
		}

		time, err := time.Parse(time.RFC3339, *body.DueDate)

		if err == nil {
			task.DueDate = &time
		}

		if err := postgres.Create(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create task")
			return
		}

		ctx.JSON(http.StatusCreated, task)
	}
}
