package router

import (
	"encoding/json"
	"main/socketManager"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// @Summary			Handle WebSocket requests
// @Description		Handle WebSocket requests
// @Tags			WebSocket
// @Success			101 "Switching Protocols"
// @Failure			500 "Internal Server Error"
// @Router			/socket [get]
func handleWebSocket(socket *socketManager.SocketManager) func(c *gin.Context) {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
			return
		}
		defer conn.Close()

		for {
			_, msg, err := conn.ReadMessage()

			if err != nil {
				break
			}

			var msgData socketManager.SocketIncomingMessage

			if err := json.Unmarshal(msg, &msgData); err != nil {
				// conn.WriteMessage(websocket.TextMessage, []byte())
				continue
			}

			switch msgData.Type {
			case "sub":
				socket.Subscribe(msgData.Body, conn)
			case "unsub":
				socket.Unsubscribe(msgData.Body, conn)
			}
		}
	}
}