package routerUtils

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