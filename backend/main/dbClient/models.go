package dbClient

import (
	"time"

	"github.com/google/uuid"
)

type PageRole string

const (
	PageRoleOwner       PageRole = "owner"
	PageRoleAdmin       PageRole = "admin"
	PageRoleMember      PageRole = "member"
	PageRoleCommentator PageRole = "commentator"
	PageRoleGuest       PageRole = "guest"
)

type PageType string

const (
	PageTypeBoard PageType = "board"
	PageTypeText  PageType = "text"
	PageTypeGroup PageType = "group"
)

type User struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email             string     `gorm:"unique;not null" json:"email"`
	EmailVerified     bool       `gorm:"not null;default:false" json:"emailVerified"`
	Picture           *string    `gorm:"type:varchar(255)" json:"picture,omitempty"`
	Username          string     `gorm:"not null" json:"username"`
	LastPasswordReset *time.Time `gorm:"type:timestamptz" json:"lastPasswordReset,omitempty"`
	LastLogin         time.Time  `gorm:"type:timestamptz" json:"lastLogin,omitempty"`

	CreatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`
}

type UserCredentials struct {
	ID                     uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	PasswordHash           string    `gorm:"not null" json:"passwordHash"`
	PasswordResetToken     *string   `gorm:"type:varchar(255)" json:"passwordResetToken,omitempty"`
	EmailVerificationToken *string   `gorm:"type:varchar(255)" json:"emailVerificationToken,omitempty"`

	CreatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`

	UserID uuid.UUID `gorm:"type:uuid;not null" json:"-"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

type Page struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Type     PageType  `gorm:"type:page_types;not null;default:'text'" json:"type"`
	Name     string    `gorm:"not null" json:"name"`
	UserRole PageRole  `gorm:"-" json:"userRole"`

	CreatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`

	OwnerID  uuid.UUID  `gorm:"type:uuid;not null" json:"-"`
	ParentID *uuid.UUID `gorm:"type:uuid" json:"-"`

	Owner         *User         `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	ParentPage    *Page         `gorm:"foreignKey:ParentID" json:"parentPage,omitempty"`
	ChildrenPages *[]Page       `gorm:"foreignKey:ParentID" json:"childrenPages,omitempty"`
	PageAccesses  *[]PageAccess `gorm:"foreignKey:PageID" json:"pageAccesses,omitempty"`
	TextPageLine  *TextPageLine `gorm:"foreignKey:PageID" json:"textLines,omitempty"`
	Tasks         *[]Task       `gorm:"foreignKey:PageID" json:"tasks,omitempty"`
}

type TextPageLine struct {
	ID   uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Text string    `gorm:"type:text;not null" json:"text"`

	PageID uuid.UUID `gorm:"type:uuid;not null" json:"-"`

	CreatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`
}

func (TextPageLine) TableName() string {
	return "text_page_lines"
}

type PageAccess struct {
	ID   uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Role PageRole  `gorm:"type:board_roles;not null;default:'member'" json:"role"`

	CreatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`

	UserID uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	PageID uuid.UUID `gorm:"type:uuid;not null" json:"-"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Page *Page `gorm:"foreignKey:PageID" json:"page,omitempty"`
}

type Task struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	DeletableNotByOwner bool       `gorm:"not null;default:true" json:"deletableNotByOwner"`
	Status              string     `gorm:"not null" json:"status"`
	Title               string     `gorm:"not null" json:"title"`
	Description         *string    `gorm:"type:text" json:"description,omitempty"`
	DueDate             *time.Time `gorm:"type:timestamptz" json:"dueDate,omitempty"`
	AssignedTo          *uuid.UUID `gorm:"type:uuid" json:"assignedTo,omitempty"`

	CreatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"type:timestamptz;not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
	DeletedAt *time.Time `gorm:"type:timestamptz" json:"deletedAt,omitempty"`

	PageID  uuid.UUID `gorm:"type:uuid;not null" json:"-"`
	OwnerID uuid.UUID `gorm:"type:uuid;not null" json:"-"`

	Owner        *User `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	AssignedUser *User `gorm:"foreignKey:AssignedTo" json:"assignedUser,omitempty"`
	Page         *Page `gorm:"foreignKey:PageID" json:"page,omitempty"`
}
