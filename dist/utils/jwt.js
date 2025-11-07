"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = hashToken;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.getRefreshTokenMaxAgeMs = getRefreshTokenMaxAgeMs;
// utils/token.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined");
}
// durations in seconds (we will treat env vars as seconds when provided)
const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || "900", 10); // 900s = 15m
const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || "604800", 10); // 7d
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
/**
 * Hash a token string (sha256 hex) for safe DB storage.
 */
function hashToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
}
/**
 * Create an access token. We put `exp` in the payload (seconds since epoch) per your requirement.
 * Returns the signed JWT string and the jti used inside it.
 */
function generateAccessToken(payload) {
    const jti = (0, uuid_1.v4)();
    const exp = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRES_IN;
    const tokenPayload = { ...payload, jti, exp };
    const token = jsonwebtoken_1.default.sign(tokenPayload, ACCESS_TOKEN_SECRET);
    return { token, jti, exp };
}
/**
 * Create a refresh token (JWT string). We also include exp + jti inside its payload.
 * You will store hashToken(refreshToken) into DB along with jti and expires_at.
 */
function generateRefreshToken(payload) {
    const jti = (0, uuid_1.v4)();
    const exp = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRES_IN;
    const tokenPayload = { ...payload, jti, exp };
    const token = jsonwebtoken_1.default.sign(tokenPayload, REFRESH_TOKEN_SECRET);
    return { token, jti, exp };
}
/**
 * Verify access token (throws if invalid/expired).
 */
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
}
/**
 * Verify refresh token (throws if invalid/expired).
 */
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
}
/**
 * Helper to get expiration in milliseconds for cookie maxAge
 */
function getRefreshTokenMaxAgeMs() {
    return REFRESH_TOKEN_EXPIRES_IN * 1000;
}
