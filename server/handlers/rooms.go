package handlers

import (
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
		var message utils.Message

		if name == "" {
			message.Type = utils.Error
			message.Data = "Name cannot be empty"

			err := c.WriteJSON(&message)
			if err != nil {
				log.Error(err)
			}

			c.Close()
			return
		}

		if !utils.RoomExists(roomID) {
			message.Type = utils.Error
			message.Data = "Room with ID " + roomID + " does not exist"

			err := c.WriteJSON(&message)
			if err != nil {
				log.Error(err)
			}

			c.Close()
			return
		}

		utils.JoinRoom(roomID, c, name)

		// Keep the connection alive by listening for messages in a loop
		for {
			err := c.ReadJSON(&message)
			if err != nil {
				log.Error("Connection closed: ", err)
				break // Exit the loop if the connection closes
			}

			// when received a message, broadcast it to other users in the room
			err = utils.Broadcast(roomID, c, message)
			if err != nil {
				log.Error(err)
			}
		}

		defer func() {
			utils.LeaveRoom(roomID, c)
			c.Close()
		}()
	}, *config)(c)
}
