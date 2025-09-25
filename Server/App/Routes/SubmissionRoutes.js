import express from "express";
import authMiddleware from "../../Middleware/authMiddleware.js";
import { submitCode } from "../Controllers/SubmitController.js";

const submitRouter = express.Router();

// submit solutionCode
submitRouter.post("/submitCode/:id", authMiddleware, submitCode);

export default submitRouter;
