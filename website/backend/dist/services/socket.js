"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = initWebSocketServer;
exports.broadcastNewScan = broadcastNewScan;
const ws_1 = require("ws");
let wss = null;
const clients = new Set();
function initWebSocketServer(server) {
    wss = new ws_1.WebSocketServer({ noServer: true });
    server.on("upgrade", (request, socket, head) => {
        // Only handle upgrades if wss is set up
        if (wss) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss?.emit("connection", ws, request);
            });
        }
    });
    wss.on("connection", (ws) => {
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
function broadcastNewScan(scanData) {
    if (clients.size === 0)
        return;
    const payload = JSON.stringify({
        event: "NEW_SCAN",
        data: scanData,
    });
    console.log(`[WebSocket] Broadcasting NEW_SCAN event to ${clients.size} client(s)`);
    clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(payload);
        }
    });
}
