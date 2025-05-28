// server.js
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 3000 });

const clients = new Set();

server.on("connection", (ws) => {
  clients.add(ws);
  ws.id = Math.random().toString(36).substr(2, 9); // Generate a simple unique ID

  ws.on("message", (msg) => {
    // Broadcast to all clients
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("WebSocket server running on ws://localhost:3000");
