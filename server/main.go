package main

import (
	"konfrens/handlers"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func init() {
	godotenv.Load()
}

func main() {
	app := fiber.New()

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",                              // Allow all origins
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH", // Allow all methods
	}))

	api := app.Group("/api")

	api.Post("/rooms", handlers.CreateRoom)

	// websocket connection
	api.Use("/rooms/:roomID", handlers.JoinRoom)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	app.Listen(":" + port)

}
