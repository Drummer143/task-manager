package apiClient

type UserIdentity struct {
	Connection string `json:"connection"`
	Provider   string `json:"provider"`
	UserID     string `json:"userId"`
	IsSocial   bool   `json:"isSocial"`
}

type User struct {
	CreatedAt         string         `json:"created_at"`
	Email             string         `json:"email"`
	EmailVerified     bool           `json:"email_verified"`
	Identities        []UserIdentity `json:"identities"`
	Name              string         `json:"name"`
	Nickname          string         `json:"nickname"`
	Picture           string         `json:"picture"`
	UpdatedAt         string         `json:"updated_at"`
	UserID            string         `json:"user_id"`
	Username          string         `json:"username"`
	LastPasswordReset string         `json:"last_password_reset"`
	LastIP            string         `json:"last_ip"`
	LastLogin         string         `json:"last_login"`
	LoginsCount       int            `json:"logins_count"`
}

type SessionUser struct {
	Aud       string `json:"aud"`
	Exp       int64  `json:"exp"`
	Iat       int64  `json:"iat"`
	Iss       string `json:"iss"`
	Name      string `json:"name"`
	Nickname  string `json:"nickname"`
	Picture   string `json:"picture"`
	Sid       string `json:"sid"`
	Sub       string `json:"sub"`
	UpdatedAt string `json:"updatedAt"`
}
