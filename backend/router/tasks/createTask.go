package tasksRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"main/validation"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

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
		session := sessions.Default(ctx)

		profile, _ := session.Get("profile").(map[string]interface{})

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

		var task dbClient.Task = dbClient.Task{
			DeletableNotByOwner: body.DeletableNotByOwner,
			Status:              body.Status,
			Title:               body.Title,
			Description:         body.Description,
			DueDate:             body.DueDate,
			AssignedTo:          body.AssignedTo,
			OwnerID:             profile["sub"].(string),
		}

		if err := db.Create(&task).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to create task")
			return
		}

		ctx.JSON(http.StatusCreated, task)
	}
}
