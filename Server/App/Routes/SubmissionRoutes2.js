import express from "express";
import authMiddleware from "../../Middleware/authMiddleware.js";
import {
  submitCode,
  runCode,
  checkJobStatus,
} from "../Controllers/submitController_2.js";
import { getQueueHealth } from "../Controllers/queueController.js";
import Submission from "../Models/Submission.js";
import {
  codeExecutionLimiter,
  submissionLimiter,
} from "../../Middleware/rateLimiter.js";
import adminMiddleware from "../../Middleware/adminMiddleware.js";

const submitRouter = express.Router();

// =============================================
// CODE EXECUTION ROUTES
// =============================================

// Submit solution for evaluation (goes to queue)
submitRouter.post(
  "/submitCode/:id",
  authMiddleware,
  submissionLimiter,
  submitCode
);

// Test code without submission (goes to queue)
submitRouter.post(
  "/runCode/:id",
  authMiddleware,
  codeExecutionLimiter,
  runCode
);

// Check job status in queue
submitRouter.get("/job-status/:jobId", authMiddleware, checkJobStatus);

// =============================================
// SUBMISSION STATUS ROUTES
// =============================================

// Check submission status (for database submissions)
submitRouter.get("/status/:submissionId", authMiddleware, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      _id: submissionId,
      userId: userId,
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
        response: false,
      });
    }

    res.status(200).json({
      message: "Submission status retrieved",
      response: true,
      submission: {
        id: submission._id,
        status: submission.status,
        testCasesPassed: submission.testCasesPassed,
        testCasesTotal: submission.testCasesTotal,
        runtime: submission.runtime,
        memory: submission.memory,
        errorMessage: submission.errorMessage,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error checking submission status:", error);
    res.status(500).json({
      message: "Error checking submission status",
      response: false,
      error: error.message,
    });
  }
});

// =============================================
// QUEUE MONITORING ROUTES
// =============================================

// Check queue health and status
submitRouter.get("/queue/health", adminMiddleware, getQueueHealth);

export default submitRouter;
