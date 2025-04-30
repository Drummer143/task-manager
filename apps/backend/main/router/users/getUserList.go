package usersRouter

import (
	"main/internal/postgres"
	"main/utils/errorHandlers"
	"main/utils/pagination"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary				Get user list
// @Description 		Get user list
// @Tags				Users
// @Param				username_or_email query string false "filter by username or email"
// @Param				limit query int false "If not provided or less than 1, all users will be returned"
// @Param				offset query int false "Default is 0"
// @Param				exclude query string false "comma separated list of ids to exclude"
// @Produce				json
// @Success				200 {object} pagination.ResponseWithPagination[postgres.User] "User list"
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				500 {object} errorHandlers.Error
// @Router				/users [get]
func getUserList(ctx *gin.Context) {
	usernameOrEmail := ctx.Query("username_or_email")
	exclude := ctx.Query("exclude")

	dbWithPagination := postgres.DB

	limit, offset := pagination.ValidatePaginationParams(ctx, pagination.DefaultPaginationLimit, pagination.DefaultPaginationOffset)

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

	var users []postgres.User

	if err := dbWithPagination.Find(&users).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	var total int64

	if err := dbWithPagination.Model(&postgres.User{}).Count(&total).Error; err != nil {
		errorHandlers.InternalServerError(ctx)
		return
	}

	if limit == 0 {
		limit = int(total)
	}

	if users == nil {
		users = []postgres.User{}
	}

	ctx.JSON(200, pagination.NewResponseWithPagination(users, limit, offset, int(total)))
}
