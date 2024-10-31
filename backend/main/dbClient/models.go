package dbClient

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email             string     `gorm:"type:varchar(63);unique;not null" json:"email"`
	EmailVerified     bool       `gorm:"default:false" json:"email_verified"`
	Picture           *string    `gorm:"type:varchar(255)" json:"picture,omitempty"`
	Username          string     `gorm:"type:varchar(63);not null" json:"username"`
	LastPasswordReset *time.Time `gorm:"column:last_password_reset" json:"last_password_reset,omitempty"`
	LastLogin         *time.Time `gorm:"column:last_login" json:"last_login,omitempty"`
	CreatedAt         *time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt         *time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt         *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`
}

type Task struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OwnerID             uuid.UUID  `gorm:"type:uuid;not null" json:"owner_id"`
	DeletableNotByOwner bool       `gorm:"default:true" json:"deletableNotByOwner"`
	Status              string     `gorm:"type:task_statuses;not null" json:"status"`
	Title               string     `gorm:"type:varchar(255);not null" json:"title"`
	Description         *string    `gorm:"type:text" json:"description,omitempty"`
	DueDate             *string    `gorm:"type:timestamp" json:"dueDate,omitempty"`
	AssignedTo          *uuid.UUID `gorm:"type:uuid" json:"assignedTo,omitempty"`
	CreatedAt           *time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt           *time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt           *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`
}

type UserCredentials struct {
	ID                     uuid.UUID  `gorm:"type:uuid;primaryKey;unique;default:uuid_generate_v4()"`
	UserID                 uuid.UUID  `gorm:"type:uuid;not null"`
	PasswordHash           string     `gorm:"type:varchar(255);not null"`
	PasswordResetToken     *string    `gorm:"type:varchar(255)"`
	EmailVerificationToken *string    `gorm:"type:varchar(255)"`
	CreatedAt              *time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP"`
	UpdatedAt              *time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP"`
	DeletedAt              *time.Time `gorm:"type:timestamptz"`
}
