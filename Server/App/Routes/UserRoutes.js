import express from "express";
import authMiddleware from "../../Middleware/authMiddleware.js";
import adminMiddleware from "../../Middleware/adminMiddleware.js";
import {
  adminRegister,
  Login,
  Logout,
  Register,
  Check,
} from "../Controllers/UserController.js";
import { authLimiter } from "../../Middleware/rateLimiter.js";

const AuthRouter = express.Router();

// Register
AuthRouter.post("/register", authLimiter, Register);

// Login
AuthRouter.post("/login", authLimiter, Login);

// Logout
AuthRouter.post("/logout", authMiddleware, Logout);

// check
AuthRouter.get("/check", authMiddleware, Check);

// adminRegister
AuthRouter.post("/admin/register", adminMiddleware, adminRegister);

// // Forgot Password
// AuthRouter.post("/forgot-password", forgotPassword);

// // Reset Password
// AuthRouter.post("/reset-password", resetPassword);

// // Verify Email
// AuthRouter.post("/verify-email", verifyEmail);

// // Get User Profile
// AuthRouter.get("/profile", getUserProfile);

// // Update User Profile
// AuthRouter.put("/profile", updateUserProfile);

// // Delete User Account
// AuthRouter.delete("/profile", deleteUserAccount);

// // Google Sign-In
// AuthRouter.post("/google-signin", googleSignIn);

export default AuthRouter;
