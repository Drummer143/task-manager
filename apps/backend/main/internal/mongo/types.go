package mongo

import (
	"time"

	"github.com/google/uuid"
)

// type Change struct {
// 	From any `json:"from"`
// 	To   any `json:"to"`
// }

type ShortUserInfo struct {
	Id       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Picture  *string   `json:"picture,omitempty"`
}

// type EntityVersionDocument struct {
// 	Version   int               `json:"version"`
// 	Id        uuid.UUID         `json:"id"`
// 	Changes   map[string]Change `json:"changes"`
// 	Author    ShortUserInfo     `json:"author"`
// 	CreatedAt time.Time         `json:"created_at"`
// }

type TaskChatMessage struct {
	ID        uuid.UUID     `json:"id"`
	TaskID    uuid.UUID     `json:"-"`
	Author    ShortUserInfo `json:"author"`
	Text      string        `json:"text"`
	CreatedAt time.Time     `json:"createdAt"`
}

type Mark struct {
	Type  string                 `json:"type"`
	Attrs map[string]interface{} `json:"attrs,omitempty"`
}

type EditorContent struct {
	Type    string                 `json:"type,omitempty"`
	Attrs   map[string]interface{} `json:"attrs,omitempty"`
	Content []EditorContent        `json:"content,omitempty"`
	Marks   []Mark                 `json:"marks,omitempty"`
	Text    string                 `json:"text,omitempty"`
	PageID  *uuid.UUID             `json:"-"`
	Version *int                   `json:"-"`
}
