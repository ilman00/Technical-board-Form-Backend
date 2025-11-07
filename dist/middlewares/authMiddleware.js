"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
/**
 * Middleware to protect routes.
 * - Reads access token from Authorization header
 * - Verifies the token
 * - If valid => attach user to request and continue
 * - If expired or invalid => return 401 (client must call /refresh endpoint)
 */
async function authenticate(req, res, next) {
    // Read access token from Authorization header
    const authHeader = req.headers.authorization;
    console.log("Inside authenticate Middleware");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("Access Token", accessToken);
    try {
        // Verify access token (will throw if invalid or expired)
        const payload = (0, jwt_1.verifyAccessToken)(accessToken);
        console.log("User data from middleware: ", payload);
        // Attach user payload to request
        req.user = payload;
        // Continue to next middleware/route handler
        return next();
    }
    catch (err) {
        // Token is invalid or expired
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access token expired",
                code: "TOKEN_EXPIRED" // Client can check this to trigger refresh
            });
        }
        // Token is invalid (tampered, malformed, etc.)
        return res.status(401).json({ message: "Invalid access token" });
    }
}
