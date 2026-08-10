"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scanController_1 = require("../controllers/scanController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Log scan is called directly by the extension (public with verification if necessary, or open)
router.post("/logs", scanController_1.logScan);
// Secured routes for dashboard access
router.get("/logs", auth_1.authenticateJWT, scanController_1.getLogs);
router.get("/stats", auth_1.authenticateJWT, scanController_1.getStats);
exports.default = router;
