// utils/token.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined");
}

// durations in seconds (we will treat env vars as seconds when provided)
const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || "900", 10); // 900s = 15m
const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || "604800", 10); // 7d

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export type TokenPayload = { userId: string; role?: string; jti?: string } & JwtPayload;

/**
 * Hash a token string (sha256 hex) for safe DB storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create an access token. We put `exp` in the payload (seconds since epoch) per your requirement.
 * Returns the signed JWT string and the jti used inside it.
 */
export function generateAccessToken(payload: { userId: string; role?: string }) {
  const jti = uuidv4();
  const exp = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRES_IN;
  const tokenPayload = { ...payload, jti, exp };
  const token = jwt.sign(tokenPayload as object, ACCESS_TOKEN_SECRET);
  return { token, jti, exp };
}

/**
 * Create a refresh token (JWT string). We also include exp + jti inside its payload.
 * You will store hashToken(refreshToken) into DB along with jti and expires_at.
 */
export function generateRefreshToken(payload: { userId: string; role?: string }) {
  const jti = uuidv4();
  const exp = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRES_IN;
  const tokenPayload = { ...payload, jti, exp };
  const token = jwt.sign(tokenPayload as object, REFRESH_TOKEN_SECRET);
  return { token, jti, exp };
}

/**
 * Verify access token (throws if invalid/expired).
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
}

/**
 * Verify refresh token (throws if invalid/expired).
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
}

/**
 * Helper to get expiration in milliseconds for cookie maxAge
 */
export function getRefreshTokenMaxAgeMs() {
  return REFRESH_TOKEN_EXPIRES_IN * 1000;
}
