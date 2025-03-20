package router

import (
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
func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		err = conn.WriteMessage(messageType, msg)
		if err != nil {
			break
		}
	}
}