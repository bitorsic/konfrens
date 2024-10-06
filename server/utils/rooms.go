package utils

import (
	"crypto/rand"
	"math/big"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type Room struct {
	clients map[*websocket.Conn]bool
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
		clients: make(map[*websocket.Conn]bool),
	}

	rooms[roomID] = room

	return roomID
}

func RoomExists(roomID string) bool {
	_, exists := rooms[roomID]

	return exists
}
