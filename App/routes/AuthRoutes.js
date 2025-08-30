import express from "express";
import AuthMiddlewarefxn from "../../Middleware/AuthMiddleware";

const AuthRouter = express.Router();

// Register
AuthRouter.post("/register", register);

// Login
AuthRouter.post("/login", login);

// Logout
AuthRouter.post("/logout", AuthMiddlewarefxn, logout);

// Forgot Password
AuthRouter.post("/forgot-password", forgotPassword);

// Reset Password
AuthRouter.post("/reset-password", resetPassword);

// Verify Email
AuthRouter.post("/verify-email", verifyEmail);

// Get User Profile
AuthRouter.get("/profile", getUserProfile);

// Update User Profile
AuthRouter.put("/profile", updateUserProfile);

// Delete User Account
AuthRouter.delete("/profile", deleteUserAccount);

// Google Sign-In
AuthRouter.post("/google-signin", googleSignIn);

export default AuthRouter;
