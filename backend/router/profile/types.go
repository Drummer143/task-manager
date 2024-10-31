package profileRouter

type patchProfileBody struct {
	Name     string `json:"name" validate:"required"`
	Nickname string `json:"nickname" validate:"required"`
	Username string `json:"username" validate:"required"`
}

type changeEmailBody struct {
	Email string `json:"email" validate:"required,email"`
}