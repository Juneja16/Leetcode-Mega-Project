import express from "express";
const ProblemRouter = express.Router();

// Create the Problem
ProblemRouter.post("/createProblem", createProblem);

// Update Problem
ProblemRouter.put("/updateProblem/:id", updateProblem);

// Delete problem
ProblemRouter.delete("/deleteProblem/:id", deleteProblem);

// Get all problems
ProblemRouter.get("/getAllProblems", getAllProblems);

// Get a single problem
ProblemRouter.get("/getProblem/:id", getProblem);

// Get problems by user
ProblemRouter.get("/getProblemsByUser/:userId", getProblemsByUser);

// Get problems by status
ProblemRouter.get("/getProblemsByStatus/:status", getProblemsByStatus);

// Total problems Solved
ProblemRouter.get("/getTotalProblemsSolved", getTotalProblemsSolved);

export default ProblemRouter;