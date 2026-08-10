"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "cyber_shield_super_secret_jwt_key";
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1]; // Bearer <token>
        if (!token) {
            return res.status(401).json({ error: "Authentication token is missing" });
        }
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Invalid or expired token" });
            }
            req.user = decoded;
            next();
        });
    }
    else {
        res.status(401).json({ error: "Authorization header is required" });
    }
}
