import express from "express";
import authMiddleware from "../../Middleware/authMiddleware.js";
import { submitCode, runCode } from "../Controllers/SubmitController.js";

const submitRouter = express.Router();

// submit solutionCode
submitRouter.post("/submitCode/:id", authMiddleware, submitCode);
submitRouter.post("/runCode/:id", authMiddleware, runCode);

export default submitRouter;
