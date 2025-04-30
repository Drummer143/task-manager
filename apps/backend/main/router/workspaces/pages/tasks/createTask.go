package tasksRouter

import (
	"main/internal/postgres"
	"main/internal/validation"
	"main/utils/errorHandlers"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
// @Param			workspace_id path string true "Workspace ID"
// @Param			page_id path int true "Page ID"
// @Param 			task body createTaskBody true "Task object that needs to be created"
// @Success 		201 {object} postgres.Task
// @Failure 		400 {object} errorHandlers.Error
// @Failure			401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/workspaces/{workspace_id}/pages/{page_id}/tasks [post]
func createTask(ctx *gin.Context) {
	var body createTaskBody

	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, "invalid request body", nil)
		return
	}

	if err := validation.Validator.Struct(body); err != nil {
		if errors, ok := validation.ParseValidationError(err); ok {
			errorHandlers.BadRequest(ctx, "invalid request body", errors)
			return
		}

		errorHandlers.BadRequest(ctx, "invalid request body", nil)
		return
	}

	session := sessions.Default(ctx)

	userId, _ := session.Get("id").(uuid.UUID)

	var task postgres.Task = postgres.Task{
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

	if err := postgres.DB.Create(&task).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "failed to create task")
		return
	}

	ctx.JSON(http.StatusCreated, task)
}
