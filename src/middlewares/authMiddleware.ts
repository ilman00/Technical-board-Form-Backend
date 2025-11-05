// middlewares/authenticate.ts
import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { TokenPayload } from "../utils/jwt";

// Extend Request to include user
// types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}


/**
 * Middleware to protect routes.
 * - Reads access token from Authorization header
 * - Verifies the token
 * - If valid => attach user to request and continue
 * - If expired or invalid => return 401 (client must call /refresh endpoint)
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
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
    const payload = verifyAccessToken(accessToken);
    console.log("User data from middleware: ", payload);
    
    // Attach user payload to request
    req.user = payload;
    
    // Continue to next middleware/route handler
    return next();
  } catch (err: any) {
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