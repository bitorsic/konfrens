package handlers

import (
	"fmt"
	"konfrens/utils"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
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
		name := c.Query("name")
		if name == "" {
			message := "Name cannot be empty"
			c.WriteMessage(websocket.TextMessage, []byte(message))
			c.Close()
			return
		}

		if !utils.RoomExists(roomID) {
			message := "Room with ID " + roomID + " does not exist"
			c.WriteMessage(websocket.TextMessage, []byte(message))
			c.Close()
			return
		}

		utils.JoinRoom(roomID, c, name)
		fmt.Printf("Room %v joined by %v", roomID, name)

		// Keep the connection alive by listening for messages in a loop
		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Error("Connection closed:", err)
				break // Exit the loop if the connection closes
			}

			// when received a message, broadcast it to other users in the room
			err = utils.Broadcast(roomID, c, msg)
			if err != nil {
				c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
			}
		}

		defer func() {
			utils.LeaveRoom(roomID, c)
			fmt.Printf("Room %v left by %v", roomID, name)
			c.Close()
		}()
	}, *config)(c)
}
