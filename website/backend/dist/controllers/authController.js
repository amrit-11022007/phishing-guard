"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../services/db"));
const JWT_SECRET = process.env.JWT_SECRET || "cyber_shield_super_secret_jwt_key";
async function signup(req, res) {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(201).json({
            message: "User created successfully",
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
