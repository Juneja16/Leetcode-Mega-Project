import jwt from "jsonwebtoken";
import client from "../App/Config/redis.js";

// Now we want to confirm that the user is a super admin before allowing the creation of a new admin
const adminMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = jwt.decode(token);
  const User = await User.findById(payload.id);
  if (!User || User.role !== "super-admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // if token is blacklist of Redis then not Allowed
  const isBlacklisted = await client.get(`token:${token}`);
  if (isBlacklisted) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

export default adminMiddleware;
