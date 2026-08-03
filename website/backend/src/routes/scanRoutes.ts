import { Router } from "express";
import { logScan, getLogs, getStats } from "../controllers/scanController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

// Log scan is called directly by the extension (public with verification if necessary, or open)
router.post("/logs", logScan);

// Secured routes for dashboard access
router.get("/logs", authenticateJWT, getLogs);
router.get("/stats", authenticateJWT, getStats);

export default router;
