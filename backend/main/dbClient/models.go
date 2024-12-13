package dbClient

import (
	"time"

	"github.com/google/uuid"
)

type BoardUserRole string

const (
	BoardRoleOwner   BoardUserRole = "owner"
	BoardRoleAdmin   BoardUserRole = "admin"
	BoardRoleMember  BoardUserRole = "member"
	BoardRoleComment BoardUserRole = "commentator"
	BoardRoleGuest   BoardUserRole = "guest"
)

type User struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email             string     `gorm:"type:varchar(63);unique;not null" json:"email"`
	EmailVerified     bool       `gorm:"default:false" json:"emailVerified"`
	Picture           *string    `gorm:"type:varchar(255)" json:"picture,omitempty"`
	Username          string     `gorm:"type:varchar(63);not null" json:"username"`
	LastPasswordReset *time.Time `gorm:"type:timestamptz" json:"lastPasswordReset,omitempty"`
	LastLogin         time.Time  `gorm:"type:timestamptz" json:"lastLogin,omitempty"`
	CreatedAt         *time.Time `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt         *time.Time `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt         *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`
}

type Task struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	OwnerID             uuid.UUID  `gorm:"type:uuid;not null" json:"-"`
	BoardID             uuid.UUID  `gorm:"type:uuid;not null" json:"-"`
	DeletableNotByOwner bool       `gorm:"default:true" json:"deletableNotByOwner"`
	Status              string     `gorm:"type:task_statuses;not null" json:"status"`
	Title               string     `gorm:"type:varchar(255);not null" json:"title"`
	Description         *string    `gorm:"type:text" json:"description,omitempty"`
	DueDate             *string    `gorm:"type:timestamp" json:"dueDate,omitempty"`
	AssignedTo          *uuid.UUID `gorm:"type:uuid" json:"assignedTo,omitempty"`
	CreatedAt           *time.Time `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt           *time.Time `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt           *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`

	Owner *User  `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Board *Board `gorm:"foreignKey:BoardID" json:"board,omitempty"`
}

type UserCredentials struct {
	ID                     uuid.UUID  `gorm:"type:uuid;primaryKey;unique;default:uuid_generate_v4()" json:"id"`
	UserID                 uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	PasswordHash           string     `gorm:"type:varchar(255);not null" json:"passwordHash"`
	PasswordResetToken     *string    `gorm:"type:varchar(255)" json:"passwordResetToken,omitempty"`
	EmailVerificationToken *string    `gorm:"type:varchar(255)" json:"emailVerificationToken,omitempty"`
	CreatedAt              *time.Time `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt              *time.Time `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt              *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`
}

type Board struct {
	ID        uuid.UUID  `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	Name      string     `gorm:"size:255;not null" json:"name"`
	OwnerID   uuid.UUID  `gorm:"type:uuid;not null" json:"-"`
	CreatedAt time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`

	UserRole BoardUserRole `gorm:"-" json:"userRole,omitempty"`

	Owner         *User            `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Tasks         *[]Task          `gorm:"foreignKey:BoardID" json:"tasks,omitempty"`
	BoardAccesses *[]BoardAccesses `gorm:"foreignKey:BoardID" json:"boardAccesses,omitempty"`
}

type BoardAccesses struct {
	ID        uuid.UUID     `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"-"`
	UserID    uuid.UUID     `gorm:"type:uuid;not null" json:"-"`
	BoardID   uuid.UUID     `gorm:"type:uuid;not null" json:"-"`
	Role      BoardUserRole `gorm:"type:board_roles;not null" json:"role"`
	CreatedAt time.Time     `gorm:"type:timestamptz,default:CURRENT_TIMESTAMP" json:"createdAt"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
