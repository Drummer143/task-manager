package pagination

import (
	"strconv"

	"github.com/gin-gonic/gin"
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

func NewResponseWithPagination[T any](data []T, limit int, offset int, total int) ResponseWithPagination[T] {
	return ResponseWithPagination[T]{
		Data: data,
		Meta: Meta{
			Total:   total,
			Limit:   limit,
			Offset:  offset,
			HasMore: offset+limit < total,
		},
	}
}

const (
	DefaultPaginationLimit  = 10
	DefaultPaginationOffset = 0
)

// Validates pagination params: limit and offset.
func ValidatePaginationParams(ctx *gin.Context, fallbackLimit int, fallbackOffset int) (int, int) {
	limitStr := ctx.Query("limit")
	offsetStr := ctx.Query("offset")

	limit, offset := fallbackLimit, fallbackOffset

	if limitStr != "" {
		lim, err := strconv.ParseInt(limitStr, 10, 64)

		if err == nil && lim > 0 {
			limit = int(lim)
		}
	}

	if offsetStr != "" {
		off, err := strconv.ParseInt(offsetStr, 10, 64)

		if err == nil && int64(off) > 0 {
			offset = int(off)
		}
	}

	return limit, offset
}
