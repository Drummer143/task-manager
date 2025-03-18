package usersRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Meta struct {
	Total   int  `json:"total"`
	Limit   int  `json:"limit"`
	Offset  int  `json:"offset"`
	HasMore bool `json:"hasMore"`
}

type ResponseWithPagination[T any] struct {
	Data []T  `json:"data"`
	Meta Meta `json:"meta"`
}

// @Summary				Get user list
// @Description 		Get user list
// @Tags				Users
// @Param				username_or_email query string false "filter by username or email"
// @Param				limit query int false "If not provided or less than 1, all users will be returned"
// @Param				offset query int false "Default is 0"
// @Param				exclude query string false "comma separated list of ids to exclude"
// @Produce				json
// @Success				200 {object} ResponseWithPagination[dbClient.User] "User list"
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				500 {object} errorHandlers.Error
// @Router				/users [get]
func getUserList(postgres *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		usernameOrEmail := c.Query("username_or_email")
		limitStr := c.Query("limit")
		offsetStr := c.Query("offset")
		exclude := c.Query("exclude")

		var limit, offset int

		dbWithPagination := postgres

		if limitStr != "" {
			lim, err := strconv.ParseInt(limitStr, 10, 64)

			if err == nil && lim > 0 {
				limit = int(lim)
				dbWithPagination = dbWithPagination.Limit(int(limit))
			}
		}

		if offsetStr != "" {
			off, err := strconv.ParseInt(offsetStr, 10, 64)

			if err == nil && int64(off) > 0 {
				offset = int(off)
				dbWithPagination = dbWithPagination.Offset(int(offset))
			}
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

		c.JSON(200, ResponseWithPagination[dbClient.User]{
			Data: users,
			Meta: Meta{
				Total:   int(total),
				Limit:   limit,
				Offset:  offset,
				HasMore: offset+limit < int(total),
			},
		})
	}
}
