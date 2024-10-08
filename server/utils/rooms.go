package utils

import (
	"crypto/rand"
	"math/big"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type Room struct {
	// connection: name
	clients map[*websocket.Conn]string
	lock    sync.Mutex
}

// global var for all rooms => roomID: room
var rooms = make(map[string]*Room)

// charset for roomID/code generation
const charset = "abcdefghijklmnopqrstuvwxyz1234567890"

func generateCode() string {
	result := make([]byte, 8)
	charsetLength := big.NewInt(int64(len(charset)))

	for i := range result {
		// generate a secure random number in the range of the charset length
		num, _ := rand.Int(rand.Reader, charsetLength)
		result[i] = charset[num.Int64()]
	}

	return string(result)
}

func CreateRoom() string {
	roomID := generateCode()

	room := &Room{
		clients: make(map[*websocket.Conn]string),
	}

	rooms[roomID] = room

	return roomID
}

func RoomExists(roomID string) bool {
	_, exists := rooms[roomID]

	return exists
}

func JoinRoom(roomID string, conn *websocket.Conn, name string) {
	room := rooms[roomID]

	room.lock.Lock()
	room.clients[conn] = name
	room.lock.Unlock()
}

func LeaveRoom(roomID string, conn *websocket.Conn) {
	room := rooms[roomID]

	room.lock.Lock()
	delete(room.clients, conn)
	room.lock.Unlock()
}

func Broadcast(roomID string, conn *websocket.Conn, message []byte) error {
	room := rooms[roomID]

	for client := range room.clients {
		// exclude the sender
		if client == conn {
			continue
		}

		// send message to all
		if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
			return err
		}
	}

	return nil
}
