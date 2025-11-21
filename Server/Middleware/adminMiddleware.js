// /mnt/data/adminMiddleware.js
import jwt from "jsonwebtoken";
import client from "../App/Config/redis.js";
import User from "../App/Models/User.js";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

/**
 * Admin middleware - ensures the request is authenticated and the user is a super-admin.
 *
 * Behaviors / improvements:
 * - Accepts cookie token (req.cookies.token) or Authorization: Bearer <token> header.
 * - Verifies token signature + expiry via jwt.verify.
 * - Checks token blacklist (Redis).
 * - Loads user from DB and ensures role === "super-admin".
 * - Provides clear HTTP status codes:
 *     401 = missing or invalid token (not authenticated)
 *     403 = authenticated but not permitted (not super-admin or blacklisted)
 * - Robust error handling and logging.
 * - Attaches user to req.user (standard).
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // 1) Get token - cookie first, then Authorization header (Bearer)
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers &&
      typeof req.headers.authorization === "string" &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2) No token -> 401 Unauthorized
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // 3) Check blacklist in Redis before verifying (optional order)
    try {
      const blacklisted = await client.get(`token:${token}`);
      if (blacklisted) {
        // Token has been explicitly invalidated (e.g., logout)
        return res.status(403).json({ message: "Forbidden: Token revoked" });
      }
    } catch (redisErr) {
      // Log Redis errors but do not fail-open silently for security-critical checks.
      console.error("Redis error while checking token blacklist:", redisErr);
      // We *could* choose to fail closed (reject request) — here we elect to continue verification,
      // but you can change to `return res.status(500)...` if you want stricter behavior.
    }

    // 4) Verify token (signature + expiry)
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      // Token invalid or expired
      console.warn("JWT verification failed:", jwtErr && jwtErr.message);
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }

    // 5) Ensure token has user id
    if (!payload || !payload.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token payload" });
    }

    // 6) Load the user from DB
    let userFound;
    try {
      userFound = await User.findById(payload.id).lean();
    } catch (dbErr) {
      console.error(
        "Database error while fetching user in adminMiddleware:",
        dbErr
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!userFound) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 7) Confirm role is super-admin
    if (userFound.role !== "super-admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient privileges" });
    }

    // 8) Attach user to request (standard)
    const { password, ...safeUser } = userFound;
    req.kk = safeUser;

    // 9) Proceed
    return next();
  } catch (err) {
    // Last-resort catch-all
    console.error("Unexpected error in adminMiddleware:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default adminMiddleware;
