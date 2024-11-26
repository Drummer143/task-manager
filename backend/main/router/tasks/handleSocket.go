package tasksRouter

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var updrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return r.Header.Get("Origin") == "http://localhost:5173"
	},
}

var connections = make(map[string][]*websocket.Conn)

// @Summary			Connect to tasks socket
// @Description 	Connect to tasks socket
// @Tags			Tasks
// @Produce			json
// @Success			101
// @Router			/tasks/socket [get]
func handleSocket(db *gorm.DB, validate *validator.Validate) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		conn, err := updrader.Upgrade(ctx.Writer, ctx.Request, nil)

		if err != nil {
			return
		}

		defer conn.Close()

		conn.SetCloseHandler(func(code int, text string) error {
			connections[conn.RemoteAddr().String()] = nil
			return nil
		})

		for {
			_, message, err := conn.ReadMessage()

			if err != nil {
				break
			}

			var req SocketMessageRequest

			if err := json.Unmarshal(message, &req); err != nil {
				continue
			}

			switch req.Type {
			case "track-changes":
				var id string

				if err := json.Unmarshal(req.Body, &id); err != nil {
					continue
				}

				connections[id] = append(connections[id], conn)
			case "untrack-changes":
				var id string

				if err := json.Unmarshal(req.Body, &id); err != nil {
					continue
				}

				for i, c := range connections[id] {
					if c == conn {
						connections[id] = append(connections[id][:i], connections[id][i+1:]...)
					}
				}
			case "get-task":
				if task, err := getSingleTaskWS(db, req.Body); err != nil {
					conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
				} else {
					conn.WriteJSON(SocketMessageResponse{Type: "get-task", Body: task})
				}
			case "get-tasks":
				if tasks, err := getTaskListWS(db, ctx); err != nil {
					conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
				} else {
					conn.WriteJSON(SocketMessageResponse{Type: "get-tasks", Body: tasks})
				}
			case "create-task":
				if task, validationError, err := createTaskWS(ctx, req.Body, db, validate); err != nil {
					if validationError != nil {
						conn.WriteJSON(validationError)
					} else {
						conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
					}
				} else {
					conn.WriteJSON(SocketMessageResponse{Type: "create-task", Body: task})
				}
			case "change-status":
				if task, validationError, err := changeStatusWS(db, req.Body, validate); err != nil {
					if validationError != nil {
						conn.WriteJSON(validationError)
					} else {
						conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
					}
				} else {
					conn.WriteJSON(SocketMessageResponse{Type: "change-status", Body: task})
				}
			case "update-task":
				if err := updateTaskWS(db, validate, req.Body, conn); err != nil {
					conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
				}
			case "delete-task":
				if err := deleteTaskWS(db, req.Body); err != nil {
					conn.WriteMessage(websocket.TextMessage, []byte(err.Error()))
				}
			}
		}
	}
}
