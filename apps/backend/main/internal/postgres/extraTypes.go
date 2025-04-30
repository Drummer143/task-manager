package postgres

type UserRole string

const (
	UserRoleOwner       UserRole = "owner"
	UserRoleAdmin       UserRole = "admin"
	UserRoleMember      UserRole = "member"
	UserRoleCommentator UserRole = "commentator"
	UserRoleGuest       UserRole = "guest"
)

type PageType string

const (
	PageTypeBoard PageType = "board"
	PageTypeText  PageType = "text"
	PageTypeGroup PageType = "group"
)
