import express from "express";
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  getProblemsByUser,
  getTotalProblemsSolved,
  updateProblem,
  getProblemSubmissions,
} from "../Controllers/ProblemController.js";
import adminMiddleware from "../../Middleware/adminMiddleware.js";
import authMiddleware from "../../Middleware/authMiddleware.js";
import validateProblem from "../../Middleware/validateProblem.js";

const ProblemRouter = express.Router();

/* 

           Admin level Working Routes 
           
*/

// 1.Create the Problem
ProblemRouter.post(
  "/createProblem",
  adminMiddleware,
  validateProblem,
  createProblem
);

// 2.Update the Problem
ProblemRouter.put("/updateProblem/:id", adminMiddleware, updateProblem);

// 3. Delete problem
ProblemRouter.delete("/deleteProblem/:id", adminMiddleware, deleteProblem);

/* 
 
     Routes Specific For App Display Content and All  

*/

//1. Get all problems generally For Frontend to display them
ProblemRouter.get("/getAllProblems", authMiddleware, getAllProblems);

// 2.Get a single problem
ProblemRouter.get("/getProblem/:id", authMiddleware, getProblemById);

/* 

User Specific Routes i.e to Resolve Queries Related to Specific User 


*/

// 1. Get problems Solved by user For Filtering/Highliting
ProblemRouter.get("/getProblemsByUser", authMiddleware, getProblemsByUser);

//2. Total problems Solved i.e Count of Problems solved by User
ProblemRouter.get(
  "/getTotalProblemsSolved",
  authMiddleware,
  getTotalProblemsSolved
);

// 3. Get All Submission of a Specific problem of the Current USer Loggedin
ProblemRouter.get(
  "/getProblemSubmissions/:id",
  authMiddleware,
  getProblemSubmissions
);

export default ProblemRouter;
