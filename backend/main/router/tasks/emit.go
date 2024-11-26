package tasksRouter

import (
	"github.com/gorilla/websocket"
)

func emit(id string, message any, source *websocket.Conn) error {
	if connections[id] == nil {
		return nil
	}

	for _, conn := range connections[id] {
		conn.WriteJSON(map[string]any{"type": "track-changes", "body": message, "id": id})
	}

	return nil
}
