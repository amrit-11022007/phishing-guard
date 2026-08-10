import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    // Only handle upgrades if wss is set up
    if (wss) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss?.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);
    console.log(`[WebSocket] Client connected. Total active clients: ${clients.size}`);

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Total active clients: ${clients.size}`);
    });

    ws.on("error", (err) => {
      console.error("[WebSocket] Client error:", err);
      clients.delete(ws);
    });
  });
}

export function broadcastNewScan(scanData: any) {
  if (clients.size === 0) return;
  
  const payload = JSON.stringify({
    event: "NEW_SCAN",
    data: scanData,
  });

  console.log(`[WebSocket] Broadcasting NEW_SCAN event to ${clients.size} client(s)`);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
