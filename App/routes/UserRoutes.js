import express from "express";
import AuthMiddlewarefxn from "../../Middleware/authMiddleware.js";
import adminMiddleware from "../../Middleware/adminMiddleware.js";
import { adminRegister, Login, Logout, Register } from "../Controller/UserController.js";

const AuthRouter = express.Router();

// Register
AuthRouter.post("/register", Register);

// Login
AuthRouter.post("/login", Login);

// Logout
AuthRouter.post("/logout", AuthMiddlewarefxn, Logout);

// adminRegister
AuthRouter.post('/admin/register', adminMiddleware, adminRegister);

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
