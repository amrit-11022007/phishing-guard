import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { initWebSocketServer } from "./services/socket";
import authRoutes from "./routes/authRoutes";
import scanRoutes from "./routes/scanRoutes";
import { analyze } from "./controllers/scanController";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// CORS setup
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Base health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "Cyber Shield Core API" });
});

// Direct extension text analysis endpoint
app.post("/analyze", analyze);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", scanRoutes);

// Server instantiation
const server = http.createServer(app);

// WebSocket upgrade hook
initWebSocketServer(server);

// Listen
server.listen(port, () => {
  console.log(`[Cyber Shield Server] API running on http://localhost:${port}`);
  console.log(`[WebSocket Server] Active and listening for upgrade connections`);
});
