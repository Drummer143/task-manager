package dbClient

import (
	"time"
)

type Task struct {
	ID                  string    `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	OwnerID             string    `json:"-" gorm:"type:varchar(63);not null;foreignKey:UserID"`
	DeletableNotByOwner bool      `json:"deletableNotByOwner" gorm:"type:boolean;not null;default:true"`
	Status              string    `json:"status" gorm:"type:task_statuses;not null"`
	Title               string    `json:"title" gorm:"type:varchar(255);not null"`
	Description         *string   `json:"description,omitempty" gorm:"type:text;not null"`
	DueDate             *string   `json:"dueDate,omitempty" gorm:"type:timestamp"`
	AssignedTo          *string   `json:"-" gorm:"type:varchar(63)"`
	CreatedAt           time.Time `json:"createdAt" gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP"`
	DeletedAt           *string   `json:"deletedAt,omitempty" gorm:"type:timestamp"`
	Assignee            *User     `json:"assignee,omitempty" gorm:"foreignKey:AssignedTo"`
	Author              *User     `json:"author,omitempty" gorm:"foreignKey:OwnerID"`
}

type User struct {
	CreatedAt         string  `json:"createdAt" gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP"`
	Email             string  `json:"email" gorm:"type:varchar(63);not null"`
	EmailVerified     bool    `json:"emailVerified" gorm:"type:boolean;not null;default:false"`
	Name              string  `json:"name" gorm:"type:varchar(63);not null"`
	Nickname          string  `json:"nickname" gorm:"type:varchar(63);not null"`
	Picture           *string `json:"picture,omitempty" gorm:"type:varchar(255)"`
	UpdatedAt         string  `json:"updatedAt" gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP"`
	UserID            string  `json:"userId" gorm:"type:varchar(63);primary_key;not null"`
	Username          string  `json:"username" gorm:"type:varchar(63);not null"`
	LastPasswordReset *string `json:"lastPasswordReset,omitempty" gorm:"type:timestamptz"`
	LastIP            string  `json:"lastIp" gorm:"type:varchar(15)"`
	LastLogin         string  `json:"lastLogin" gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP"`
	LoginsCount       int     `json:"loginsCount" gorm:"type:int;not null;default:0"`
	DeletedAt         *string `json:"deletedAt,omitempty" gorm:"type:timestamp"`
}
