"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.verifyEmail = verifyEmail;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const db_1 = require("../config/db");
const mailer_1 = require("../utils/mailer");
const jwt_1 = require("../utils/jwt");
const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/auth/refresh"; // cookie only sent to this path by default
// ---------------- REGISTER (unchanged) ----------------
async function register(req, res) {
    const { name, email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });
    const conn = await db_1.db.getConnection();
    try {
        const [exists] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
        if (exists.length)
            return res.status(400).json({ message: "Email already registered" });
        const hashed = await bcrypt_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        await conn.query("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)", [userId, name, email, hashed]);
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await conn.query("INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [userId, token, expiresAt]);
        await conn.query("INSERT INTO affiliation_forms (user_id, created_at) VALUES (?, NOW() )", [userId]);
        await (0, mailer_1.sendVerificationEmail)(email, token);
        res.json({ message: "User registered. Please verify your email." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
    finally {
        conn.release();
    }
}
// ---------------- VERIFY EMAIL (unchanged) ----------------
async function verifyEmail(req, res) {
    const token = req.query.token;
    if (!token)
        return res.status(400).json({ message: "Token missing" });
    const conn = await db_1.db.getConnection();
    try {
        const [rows] = await conn.query("SELECT * FROM email_verification_tokens WHERE token = ? AND used = 0", [token]);
        if (rows.length === 0)
            return res.status(400).json({ message: "Invalid or used token" });
        const record = rows[0];
        if (new Date(record.expires_at) < new Date())
            return res.status(400).json({ message: "Token expired" });
        await conn.query("UPDATE users SET is_verified = 1 WHERE id = ?", [record.user_id]);
        await conn.query("UPDATE email_verification_tokens SET used = 1 WHERE id = ?", [record.id]);
        res.json({ message: "Email verified successfully." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
    finally {
        conn.release();
    }
}
// ---------------- LOGIN (issues access + refresh, stores hashed refresh token) ----------------
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });
    const conn = await db_1.db.getConnection();
    try {
        const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0)
            return res.status(400).json({ message: "Invalid credentials" });
        const user = rows[0];
        const match = await bcrypt_1.default.compare(password, user.password_hash);
        if (!match)
            return res.status(400).json({ message: "Invalid credentials" });
        if (!user.is_verified)
            return res.status(403).json({ message: "Please verify your email first." });
        // Prepare payload
        const payload = { userId: user.id, role: user.role };
        // Generate tokens (exp is included in payload inside the util)
        const { token: accessToken, jti: accessJti } = (0, jwt_1.generateAccessToken)(payload);
        const { token: refreshToken, jti: refreshJti, exp: refreshExp } = (0, jwt_1.generateRefreshToken)(payload);
        // Hash refresh token for DB storage
        const refreshTokenHash = (0, jwt_1.hashToken)(refreshToken);
        const expiresAt = new Date(refreshExp * 1000); // exp in seconds -> ms
        // Store hashed refresh token in refresh_tokens table
        await conn.query("INSERT INTO refresh_tokens ( jti, user_id, token, expires_at, device_info) VALUES ( ?, ?, ?, ?, ?)", [refreshJti, user.id, refreshTokenHash, expiresAt, req.headers["user-agent"] || null]);
        // Set refresh token cookie (httpOnly, secure in prod)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: REFRESH_COOKIE_PATH,
            maxAge: (0, jwt_1.getRefreshTokenMaxAgeMs)(),
        };
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
        // Return access token (short-lived) to client
        res.json({
            accessToken,
            message: "Login successful",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
    finally {
        conn.release();
    }
}
// ---------------- REFRESH (rotation) ----------------
async function refresh(req, res) {
    // refresh token is expected in httpOnly cookie by default
    const refreshToken = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;
    if (!refreshToken)
        return res.status(400).json({ message: "Refresh token required" });
    const conn = await db_1.db.getConnection();
    try {
        const refreshHash = (0, jwt_1.hashToken)(refreshToken);
        // Lookup stored hashed token
        const [rows] = await conn.query("SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0", [refreshHash]);
        if (rows.length === 0) {
            // possible token reuse or invalid token
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const record = rows[0];
        // Check expiration
        if (new Date(record.expires_at) < new Date()) {
            // mark revoked for hygiene
            await conn.query("UPDATE refresh_tokens SET revoked = 1 WHERE id = ?", [record.id]);
            return res.status(403).json({ message: "Refresh token expired" });
        }
        // Verify signature & payload (throws if invalid/expired)
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch (err) {
            // treat as invalid: revoke DB token record
            await conn.query("UPDATE refresh_tokens SET revoked = 1 WHERE id = ?", [record.id]);
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        // Rotation: revoke the old token row
        await conn.query("UPDATE refresh_tokens SET revoked = 1 WHERE id = ?", [record.id]);
        // Issue new tokens
        const newPayload = { userId: payload.userId, role: payload.role };
        const { token: newAccessToken } = (0, jwt_1.generateAccessToken)(newPayload);
        const { token: newRefreshToken, jti: newRefreshJti, exp: newRefreshExp } = (0, jwt_1.generateRefreshToken)(newPayload);
        const newRefreshHash = (0, jwt_1.hashToken)(newRefreshToken);
        const newExpiresAt = new Date(newRefreshExp * 1000);
        // Store new refresh token hash
        await conn.query("INSERT INTO refresh_tokens ( jti, user_id, token_hash, expires_at, device_info) VALUES (?, ?, ?, ?, ?)", [newRefreshJti, payload.userId, newRefreshHash, newExpiresAt, req.headers["user-agent"] || null]);
        // Set new cookie (rotate cookie)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: REFRESH_COOKIE_PATH,
            maxAge: (0, jwt_1.getRefreshTokenMaxAgeMs)(),
        };
        res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, cookieOptions);
        res.json({
            accessToken: newAccessToken,
            message: "Token refreshed",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
    finally {
        conn.release();
    }
}
// ---------------- LOGOUT ----------------
async function logout(req, res) {
    const refreshToken = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;
    const conn = await db_1.db.getConnection();
    try {
        if (refreshToken) {
            const refreshHash = (0, jwt_1.hashToken)(refreshToken);
            // Revoke the refresh token record(s)
            await conn.query("UPDATE refresh_tokens SET revoked = 1 WHERE token = ?", [refreshHash]);
        }
        // Clear cookie
        res.clearCookie(REFRESH_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: REFRESH_COOKIE_PATH,
        });
        res.json({ message: "Logged out" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
    finally {
        conn.release();
    }
}
