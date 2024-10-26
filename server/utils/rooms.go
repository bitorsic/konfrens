package utils

import (
	"crypto/rand"
	"errors"
	"math/big"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

const roomLimit = 2 // can be changed as use case expands

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

func RoomExistsAndIsVacant(roomID string) bool {
	room, exists := rooms[roomID]

	if !exists {
		return false
	}

	if len(room.clients) == roomLimit {
		return false
	}

	return true
}

// TODO: enforce room limit, separate offerer and answerer somehow
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

	// delete room if no participants
	if len(room.clients) == 0 {
		delete(rooms, roomID)
	}

	room.lock.Unlock()
}

func Broadcast(roomID string, conn *websocket.Conn, message Message) error {
	room := rooms[roomID]
	room.lock.Lock()
	defer room.lock.Unlock()

	// get name to fill 'from' field
	name, ok := room.clients[conn]
	if !ok {
		return errors.New("client not found in room")
	}
	message.From = name

	for client := range room.clients {
		// exclude the sender
		if client == conn {
			continue
		}

		// send message to all
		err := client.WriteJSON(message)
		if err != nil {
			return err
		}
	}

	return nil
}
