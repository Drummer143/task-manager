package zitadel

import "time"

type UserResponse struct {
	Details Details `json:"details"`
	User    User    `json:"user"`
}

type Details struct {
	ChangeDate    time.Time `json:"changeDate"`
	CreationDate  time.Time `json:"creationDate"`
	ResourceOwner string    `json:"resourceOwner"`
	Sequence      string    `json:"sequence"`
}

type User struct {
	Details            Details  `json:"details"`
	Human              Human    `json:"human"`
	LoginNames         []string `json:"loginNames"`
	PreferredLoginName string   `json:"preferredLoginName"`
	State              string   `json:"state"`
	UserID             string   `json:"userId"`
	Username           string   `json:"username"`
}

type Human struct {
	Email           Email     `json:"email"`
	MFAInitSkipped  time.Time `json:"mfaInitSkipped"`
	PasswordChanged time.Time `json:"passwordChanged"`
	Phone           Phone     `json:"phone"`
	Profile         Profile   `json:"profile"`
}

type Email struct {
	Email      string `json:"email"`
	IsVerified bool   `json:"isVerified"`
}

type Phone struct {
	// Заполнить при наличии данных
}

type Profile struct {
	DisplayName       string `json:"displayName"`
	FamilyName        string `json:"familyName"`
	Gender            string `json:"gender"`
	GivenName         string `json:"givenName"`
	NickName          string `json:"nickName"`
	PreferredLanguage string `json:"preferredLanguage"`
}
