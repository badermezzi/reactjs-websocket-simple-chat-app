package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Client represents a connected WebSocket client.
type Client struct {
	ID   string
	Conn *websocket.Conn
}

// Message structure for signaling.
// We expect the client to send messages with at least these fields.
// The payload (offer, answer, candidate) will be part of the map.
type Message struct {
	Type       string          `json:"type"`
	SenderID   string          `json:"senderId"`
	ReceiverID string          `json:"receiverId"`
	Payload    json.RawMessage `json:"payload"` // Use RawMessage to forward unknown fields
}

var (
	// Upgrader specifies parameters for upgrading an HTTP connection to a WebSocket connection.
	upgrader = websocket.Upgrader{
		// Allow connections from any origin for testing purposes.
		// In production, you should restrict this to your frontend's origin.
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	// clients stores the connected clients, mapping userID to the Client struct.
	clients = make(map[string]*Client)
	// clientsMutex protects concurrent access to the clients map.
	clientsMutex sync.Mutex
)

// handleConnections handles incoming WebSocket connections.
func handleConnections(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		log.Println("Connection rejected: userId query parameter is missing")
		http.Error(w, "userId query parameter is required", http.StatusBadRequest)
		return
	}

	// Upgrade initial GET request to a WebSocket connection.
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading connection for user %s: %v", userID, err)
		return
	}
	// Make sure we close the connection when the function returns.
	defer ws.Close()

	client := &Client{ID: userID, Conn: ws}

	// Register new client
	clientsMutex.Lock()
	// Check if user ID is already connected, maybe disconnect old one or reject new one
	if existingClient, ok := clients[userID]; ok {
		log.Printf("User ID %s already connected. Disconnecting previous connection.", userID)
		existingClient.Conn.Close() // Close the old connection
	}
	clients[userID] = client
	log.Printf("Client connected: %s", userID)
	clientsMutex.Unlock()

	// Unregister client on disconnect
	defer func() {
		clientsMutex.Lock()
		delete(clients, userID)
		log.Printf("Client disconnected: %s", userID)
		clientsMutex.Unlock()
	}()

	// Continuously read messages from the WebSocket connection.
	for {
		// Read message as raw bytes
		messageType, messageBytes, err := ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message from user %s: %v", userID, err)
			} else {
				log.Printf("Client %s closed connection.", userID)
			}
			break // Exit loop on error or close
		}

		// We only process text messages containing JSON
		if messageType != websocket.TextMessage {
			log.Printf("Received non-text message from user %s. Ignoring.", userID)
			continue
		}

		// Attempt to parse the core message structure to find the receiver
		var msgHeader struct {
			ReceiverID string `json:"receiverId"`
		}
		if err := json.Unmarshal(messageBytes, &msgHeader); err != nil {
			log.Printf("Error unmarshalling message header from user %s: %v. Message: %s", userID, err, string(messageBytes))
			continue
		}

		if msgHeader.ReceiverID == "" {
			log.Printf("Received message without receiverId from user %s. Ignoring. Message: %s", userID, string(messageBytes))
			continue
		}

		// Find the recipient client
		clientsMutex.Lock()
		recipient, ok := clients[msgHeader.ReceiverID]
		clientsMutex.Unlock()

		if !ok {
			log.Printf("Recipient %s not found for message from %s.", msgHeader.ReceiverID, userID)
			// Optionally send an error back to the sender
			continue
		}

		// Forward the raw message bytes to the recipient
		log.Printf("Forwarding message from %s to %s", userID, msgHeader.ReceiverID)
		err = recipient.Conn.WriteMessage(websocket.TextMessage, messageBytes)
		if err != nil {
			log.Printf("Error writing message to user %s: %v", msgHeader.ReceiverID, err)
			// Recipient might have disconnected, loop will handle their cleanup
		}
	}
}

func main() {
	// Configure WebSocket route
	http.HandleFunc("/ws", handleConnections)

	// Start the server on localhost port 8080
	port := "8080"
	log.Printf("Signaling server starting on port %s", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}