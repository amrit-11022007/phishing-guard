"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_1 = require("./services/socket");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const scanRoutes_1 = __importDefault(require("./routes/scanRoutes"));
const scanController_1 = require("./controllers/scanController");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
// CORS setup
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express_1.default.json());
// Base health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", service: "Cyber Shield Core API" });
});
// Direct extension text analysis endpoint
app.post("/analyze", scanController_1.analyze);
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api", scanRoutes_1.default);
// Server instantiation
const server = http_1.default.createServer(app);
// WebSocket upgrade hook
(0, socket_1.initWebSocketServer)(server);
// Listen
server.listen(port, () => {
    console.log(`[Cyber Shield Server] API running on http://localhost:${port}`);
    console.log(`[WebSocket Server] Active and listening for upgrade connections`);
});
