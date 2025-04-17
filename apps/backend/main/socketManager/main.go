package socketManager

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

type SocketManager struct {
	subscriptions map[string][]*websocket.Conn
}

type SocketIncomingMessage struct {
	Body string `json:"body"`
	Type string `json:"type"`
}

type SocketOutgoingMessage struct {
	Body  any     `json:"body"`
	SubId *string `json:"sub,omitempty"`
	Type  string  `json:"type"`
}

func NewSubscriptionManager() *SocketManager {
	return &SocketManager{
		subscriptions: make(map[string][]*websocket.Conn),
	}
}

func (sm *SocketManager) Subscribe(target string, conn *websocket.Conn) {
	sm.subscriptions[target] = append(sm.subscriptions[target], conn)
}

func (sm *SocketManager) Unsubscribe(target string, conn *websocket.Conn) {
	conns := sm.subscriptions[target]
	for i, c := range conns {
		if c == conn {
			sm.subscriptions[target] = append(conns[:i], conns[i+1:]...)
			break
		}
	}
}

func (sm *SocketManager) Broadcast(target string, message any) {
	conns := sm.subscriptions[target]

	jsonMessage, err := json.Marshal(SocketOutgoingMessage{
		Body:  message,
		SubId: &target,
		Type:  "sub",
	})
	if err != nil {
		return
	}

	for _, conn := range conns {
		err := conn.WriteMessage(websocket.TextMessage, jsonMessage)
		if err != nil {
		}
	}
}