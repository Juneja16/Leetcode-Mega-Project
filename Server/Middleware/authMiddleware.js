// /mnt/data/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import client from "../App/Config/redis.js";
import User from "../App/Models/User.js";

dotenv.config({ quiet: true });

/**
 * Auth middleware
 * - Accepts token from cookie (req.cookies.token) OR Authorization header (Bearer <token>)
 * - Verifies token signature + expiry with jwt.verify
 * - Checks Redis blacklist for revoked tokens
 * - Loads user from DB and attaches safe user object to req.user (excludes password)
 *
 * Responses:
 * - 401 Unauthorized -> missing/invalid/expired token or user not found
 * - 403 Forbidden -> token explicitly revoked (blacklisted)
 * - 500 Internal Server Error -> DB/Redis unexpected errors
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1) Retrieve token (cookie preferred, then Authorization header)
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

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // 2) Check token blacklist in Redis
    try {
      const isBlacklisted = await client.get(`token:${token}`);
      if (isBlacklisted) {
        return res.status(403).json({ message: "Forbidden: Token revoked" });
      }
    } catch (redisErr) {
      // Log Redis problems; choose whether to fail-closed in your environment.
      console.error("Redis error while checking token blacklist:", redisErr);
      // Proceeding to verify token (fail-open). If you prefer fail-closed, return 500 here.
    }

    // 3) Verify token (signature + expiry)
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.warn("JWT verification failed:", jwtErr && jwtErr.message);
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }

    // 4) Ensure payload has user id
    if (!payload || !payload.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token payload" });
    }

    const userId = payload.id;

    // 5) Load user from DB (exclude password)
    let userFound;
    try {
      userFound = await User.findById(userId).select("-password").lean();
    } catch (dbErr) {
      console.error(
        "Database error while fetching user in authMiddleware:",
        dbErr
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (!userFound) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 6) Attach safe user object and proceed
    req.user = userFound;
    return next();
  } catch (err) {
    // catch-all fallback
    console.error("Unexpected error in authMiddleware:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default authMiddleware;
