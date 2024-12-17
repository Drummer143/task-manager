package pagesRouter

import (
	"fmt"
	"main/dbClient"
	"main/router/errorHandlers"
	"main/router/utils"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @Summary 		Get page list
// @Description 	Get list of pages user has access to
// @Tags 			Pages
// @Produce 		json
// @Param 			include query string false "Include tasks in response"
// @Success 		200 {array} dbClient.Page
// @Failure 		401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure 		500 {object} errorHandlers.Error
// @Router 			/pages [get]
func getPageList(db *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)

		userId := session.Get("id").(uuid.UUID)

		include := ctx.Query("include")

		fmt.Println(include, strings.Contains(include, "tasks"))

		query := db.Joins("JOIN page_accesses ON page_accesses.page_id = pages.id").Where("page_accesses.user_id = ?", userId)

		if strings.Contains(include, "tasks") {
			query = query.Preload("Tasks")
		}

		if strings.Contains(include, "owner") {
			query = query.Preload("Owner")
		}

		if strings.Contains(include, "access") {
			query = query.Preload("PageAccesses")
		}

		var pages []dbClient.Page

		if err := query.Find(&pages).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get page list")
			return
		}

		if strings.Contains(include, "access") {
			for i := range pages {
				for _, access := range *pages[i].PageAccesses {
					if access.UserID == userId {
						pages[i].UserRole = access.Role
						break
					}
				}
			}
		} else {
			for i := range pages {
				_, access, _ := utils.CheckPageAccess(ctx, db, pages[i].ID, userId)

				pages[i].UserRole = access.Role
			}
		}

		ctx.JSON(200, pages)
	}
}
