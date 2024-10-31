package profileRouter

type patchProfileBody struct {
	Username string `json:"username" validate:"required"`
}

type changeEmailBody struct {
	Email string `json:"email" validate:"required,email"`
}