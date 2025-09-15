import express from "express";
import authMiddleware from "../../Middleware/authMiddleware.js";

const SubmitRouter = express.Router;

// submit solutionCode
SubmitRouter.post("/submitCode", authMiddleware, submitCode);

export default SubmitRouter;
