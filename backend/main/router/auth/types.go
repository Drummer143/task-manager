package authRouter

type loginBody struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type signUpBody struct {
	Email    string `json:"email" validate:"required,email,min=5,max=30"`
	Password string `json:"password" validate:"required"`
	Username string `json:"username" validate:"required"`
}
