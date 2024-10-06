package main

import (
	"konfrens/handlers"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func init() {
	godotenv.Load()
}

func main() {
	app := fiber.New()

	app.Use(logger.New())
	api := app.Group("/api")

	api.Post("/rooms", handlers.CreateRoom)
	api.Get("/rooms/:roomID", handlers.JoinRoom)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	app.Listen(":" + port)

}
