package usersRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary				Get user list
// @Description 		Get user list
// @Tags				Users
// @Param				username_or_email query string false "filter by username or email"
// @Param				limit query int false "If not provided or less than 1, all users will be returned"
// @Param				offset query int false "Default is 0"
// @Param				exclude query string false "comma separated list of ids to exclude"
// @Produce				json
// @Success				200 {object} routerUtils.ResponseWithPagination[dbClient.User] "User list"
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				500 {object} errorHandlers.Error
// @Router				/users [get]
func getUserList(postgres *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usernameOrEmail := c.Query("username_or_email")
		exclude := c.Query("exclude")

		dbWithPagination := postgres

		limit, offset := routerUtils.ValidatePaginationParams(c, routerUtils.DefaultPaginationLimit, routerUtils.DefaultPaginationOffset)

		if limit > 0 {
			dbWithPagination = dbWithPagination.Limit(limit)
		}

		if offset > 0 {
			dbWithPagination = dbWithPagination.Offset(offset)
		}

		if usernameOrEmail != "" {
			query := "%" + usernameOrEmail + "%"

			dbWithPagination = dbWithPagination.Where("email ILIKE ? OR username ILIKE ?", query, query)
		}

		if exclude != "" {
			ids := strings.Split(exclude, ",")

			dbWithPagination = dbWithPagination.Where("id NOT IN ?", ids)
		}

		var users []dbClient.User

		if err := dbWithPagination.Find(&users).Error; err != nil {
			errorHandlers.InternalServerError(c, "failed to get user list")
			return
		}

		var total int64

		if err := dbWithPagination.Model(&dbClient.User{}).Count(&total).Error; err != nil {
			errorHandlers.InternalServerError(c, "failed to get user list")
			return
		}

		if limit == 0 {
			limit = int(total)
		}

		if users == nil {
			users = []dbClient.User{}
		}

		c.JSON(200, routerUtils.ResponseWithPagination[dbClient.User]{
			Data: users,
			Meta: routerUtils.Meta{
				Total:   int(total),
				Limit:   limit,
				Offset:  offset,
				HasMore: offset+limit < int(total),
			},
		})
	}
}
