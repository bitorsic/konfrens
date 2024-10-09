package utils

type MessageType string

const (
	Error MessageType = "error"
	Chat  MessageType = "chat"
	SDP   MessageType = "sdp"
	ICE   MessageType = "ice"
)

type Message struct {
	Type MessageType `json:"type"`
	From string      `json:"from,omitempty"`
	Data interface{} `json:"data"`
}
