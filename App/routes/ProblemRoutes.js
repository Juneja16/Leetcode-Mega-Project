import express from "express";
import { createProblem, deleteProblem, getAllProblems,  getProblemById,  updateProblem } from "../Controllers/ProblemController.js";
import adminMiddleware from "../../Middleware/AdminMiddleware.js";
import authMiddleware from "../../Middleware/authMiddleware.js";
const ProblemRouter = express.Router();

// Create the Problem
ProblemRouter.post("/createProblem",adminMiddleware, createProblem);

// Update Problem
ProblemRouter.put("/updateProblem/:id", adminMiddleware,updateProblem);

// Delete problem
ProblemRouter.delete("/deleteProblem/:id", adminMiddleware,deleteProblem);

// Get all problems
ProblemRouter.get("/getAllProblems",authMiddleware, getAllProblems);

// Get a single problem
ProblemRouter.get("/getProblem/:id", authMiddleware,getProblemById);

// // Get problems by user
// ProblemRouter.get("/getProblemsByUser/:userId", getProblemsByUser);

// // Get problems by status
// ProblemRouter.get("/getProblemsByStatus/:status", getProblemsByStatus);

// // Total problems Solved
// ProblemRouter.get("/getTotalProblemsSolved", getTotalProblemsSolved);

export default ProblemRouter;
