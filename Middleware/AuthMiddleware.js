import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import client from "../App/Config/redis.js";
import User from "../App/Model/UserModel.js";
dotenv.config();

const AuthMiddlewarefxn = async (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Extract user ID from the token
    // and check if the user exists from the database
    const UserId = payload.id;
    const userFound = await User.findById(UserId);

    // Not Found
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the token is present in Redis Blacklist then not allowed
    const isBlacklisted = await client.get(`token:${token}`);
    if (isBlacklisted) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = userFound;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

export default AuthMiddlewarefxn;
