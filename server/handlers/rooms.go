package handlers

import (
	"fmt"
	"konfrens/utils"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func CreateRoom(c *fiber.Ctx) error {
	roomID := utils.CreateRoom()

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"room_id": roomID,
	})
}

// config for websockets
var config = &websocket.Config{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func JoinRoom(c *fiber.Ctx) error {
	// basic error if not upgradable
	if !websocket.IsWebSocketUpgrade(c) {
		return c.Status(fiber.StatusUpgradeRequired).JSON(fiber.Map{
			"error": "upgrade to websocket required",
		})
	}

	return websocket.New(func(c *websocket.Conn) {
		roomID := c.Params("roomID")

		if !utils.RoomExists(roomID) {
			message := "Room with ID " + roomID + " does not exist"
			c.WriteMessage(websocket.TextMessage, []byte(message))
			c.Close()
			return
		}

		c.WriteMessage(websocket.TextMessage, []byte("Just checking"))

		// Keep the connection alive by listening for messages in a loop
		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				fmt.Println("Connection closed:", err)
				break // Exit the loop if the connection closes
			}

			// Echo the received message back to the client (for testing)
			if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
				fmt.Println("Error echoing message:", err)
				break // Exit the loop if there is an error writing
			}
		}

		c.Close()
	}, *config)(c)
}
