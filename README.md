
# Konfrens

A real-time, peer-to-peer video conferencing app built with WebRTC, Go Fiber, and React. The app allows users to join a room with a unique ID, initiate a video connection, and chat, all within the browser.

## Features
- **Video Conferencing**: Real-time video and audio streaming between two users in a room.
- **WebSockets Integration**: Live chat messages and connection management handled through WebSockets.
- **WebRTC Support**: Peer-to-peer communication using WebRTC for low-latency video and audio.

## Tech Stack
- **Frontend**: React, TailwindCSS
- **Backend**: Go Fiber with WebSockets and WebRTC signaling

## Getting Started

### Prerequisites
- **React.js** and **npm** for frontend setup
- **Go** for backend setup

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/bitorsic/konfrens.git
   cd konfrens
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   go mod tidy
   ```

4. **Environment Variables**
   Set up your environment variables:
   - **Frontend**: In `client/.env` set `VITE_API_URL` and `VITE_WS_URL` for backend communication.
   - **Backend**: In `server/.env`, configure port as needed.

### Running the Application

1. **Start Backend Server**
   ```bash
   cd server
   go run main.go
   ```

2. **Start Frontend Server**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the App**
   Open `http://localhost:5173` to use the application.

### Usage

- **Create Room**: Navigate to the homepage and create a room.
- **Join Room**: Share the room ID to let another participant join.
- **Video Chat**: Start a video chat once both participants are in the room.