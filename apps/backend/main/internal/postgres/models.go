package postgres

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID  `gorm:"primaryKey;default:uuid_generate_v4()" json:"id"`
	Email             string     `gorm:"unique;not null" json:"email"`
	Username          string     `gorm:"not null" json:"username"`
	EmailVerified     bool       `gorm:"not null;default:false" json:"emailVerified"`
	Picture           *string    `json:"picture"`
	LastPasswordReset *time.Time `json:"lastPasswordReset"`
	LastLogin         time.Time  `json:"lastLogin"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

type UserCredential struct {
	ID                     uuid.UUID `gorm:"primaryKey;default:uuid_generate_v4()" json:"-"`
	PasswordHash           string    `gorm:"not null" json:"-"`
	PasswordResetToken     *string   `json:"-"`
	EmailVerificationToken *string   `json:"-"`

	UserID uuid.UUID `gorm:"unique;not null" json:"-"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"-"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"-"`
	DeletedAt *time.Time `json:"-"`
}

type UserMeta struct {
	ID                uuid.UUID  `gorm:"primaryKey;default:uuid_generate_v4()" json:"-"`
	UserID            uuid.UUID  `gorm:"unique;not null" json:"-"`
	SelectedWorkspace *uuid.UUID `json:"-"`

	User      *User      `gorm:"foreignKey:UserID" json:"-"`
	Workspace *Workspace `gorm:"foreignKey:SelectedWorkspace" json:"-"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"-"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"-"`
	DeletedAt *time.Time `json:"-"`
}

type Workspace struct {
	ID   uuid.UUID `gorm:"primaryKey;default:uuid_generate_v4()" json:"id"`
	Name string    `gorm:"not null" json:"name"`
	Type string    `gorm:"not null" json:"type"`

	Role *UserRole `gorm:"-" json:"role,omitempty"`

	OwnerID uuid.UUID `gorm:"not null" json:"-"`

	Owner *User   `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Pages []*Page `gorm:"foreignKey:WorkspaceID" json:"pages,omitempty"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

type WorkspaceAccess struct {
	ID   uuid.UUID `gorm:"primaryKey;default:uuid_generate_v4()" json:"id"`
	Role UserRole  `gorm:"not null" json:"role"`

	UserID      uuid.UUID `gorm:"not null" json:"-"`
	WorkspaceID uuid.UUID `gorm:"not null" json:"-"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

type Page struct {
	ID    uuid.UUID `gorm:"primaryKey;default:uuid_generate_v4()" json:"id"`
	Type  PageType  `gorm:"not null" json:"type"`
	Title string    `gorm:"not null" json:"title"`
	Text  *string   `json:"text,omitempty"`

	Role *UserRole `gorm:"-" json:"role,omitempty"`

	OwnerID      uuid.UUID  `gorm:"not null" json:"-"`
	WorkspaceID  uuid.UUID  `gorm:"not null" json:"-"`
	ParentPageID *uuid.UUID `gorm:"index" json:"-"`

	Owner      *User   `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	ParentPage *Page   `gorm:"foreignKey:ParentPageID" json:"parentPage,omitempty"`
	ChildPages []*Page `gorm:"foreignKey:ParentPageID" json:"childPages,omitempty"`
	Tasks      []*Task `gorm:"foreignKey:PageID" json:"tasks,omitempty"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

type PageAccess struct {
	ID   uuid.UUID `gorm:"primaryKey;default:uuid_generate_v4()" json:"id"`
	Role UserRole  `gorm:"not null" json:"role"`

	UserID uuid.UUID `gorm:"not null" json:"-"`
	PageID uuid.UUID `gorm:"not null" json:"-"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

type Task struct {
	ID          uuid.UUID  `gorm:"primaryKey;default:uuid_generate_v4()" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Status      string     `gorm:"not null" json:"status"`
	Description *string    `json:"description,omitempty"`
	DueDate     *time.Time `json:"dueDate,omitempty"`

	PageID     uuid.UUID  `gorm:"not null" json:"-"`
	AssigneeID *uuid.UUID `json:"-"`
	ReporterID uuid.UUID  `json:"-"`

	Page     *Page `gorm:"foreignKey:PageID" json:"page,omitempty"`
	Assignee *User `gorm:"foreignKey:AssigneeID" json:"assignee,omitempty"`
	Reporter *User `gorm:"foreignKey:ReporterID" json:"reporter,omitempty"`

	CreatedAt time.Time  `gorm:"default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"default:current_timestamp" json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}
