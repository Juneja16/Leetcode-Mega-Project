import Submission from "../Models/Submission.js";
import Problem from "../Models/Problem.js";
import { getLanguageById } from "../Utils/problemUtility.js";
import codeExecutionQueue from "../Services/queueService.js";

// =============================================
// SUBMIT CODE - WITH QUEUE
// =============================================

const submitCode = async (req, res) => {
  const { code, language } = req.body;
  const problemId = req.params.id;
  const userId = req.user._id;

  try {
    // Validate problem exists
    const currentProblem = await Problem.findById(problemId).lean();
    if (!currentProblem) {
      return res.status(404).send({
        message: "Problem not found",
        response: false,
      });
    }

    const { hiddenTestCases } = currentProblem;

    // Create submission record immediately with "queued" status
    const submittedResult = await Submission.create({
      code,
      language,
      problemId,
      userId,
      status: "queued", // Important: Changed from "pending" to "queued"
      testCasesTotal: hiddenTestCases.length,
      testCasesPassed: 0,
    });

    const languageId = getLanguageById(language);

    // Prepare all hidden test cases for Judge0
    const submissions = hiddenTestCases.map(({ input, output }) => ({
      source_code: code,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    // Add job to queue for background processing
    const job = await codeExecutionQueue.add("execute-code", {
      submissions: submissions,
      submissionId: submittedResult._id.toString(),
      problemId: problemId,
      userId: userId.toString(),
      isRunCode: false, // This is a real submission
    });

    console.log(
      `📥 Submit Code: Submission ${submittedResult._id} → Job ${job.id}`
    );

    // Immediate response - processing happens in background
    res.status(202).send({
      // 202 Accepted = processing
      message: "Code submitted successfully! Processing in background...",
      response: true,
      submissionId: submittedResult._id,
      jobId: job.id,
      status: "queued",
    });
  } catch (error) {
    console.error("Error in submitCode:", error.message);
    res.status(500).send({
      message: "Something went wrong while submitting the code",
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

// =============================================
// RUN CODE - WITH QUEUE
// =============================================

const runCode = async (req, res) => {
  console.log("Inside Run Controller");
  //   console.log("Inside Run Controller");
  const { code, language } = req.body;
  const problemId = req.params.id;
  const userId = req.user._id;

  try {
    console.log("Inside Run Controller try block");
    // Validate problem exists
    const currentProblem = await Problem.findById(problemId).lean();
    if (!currentProblem) {
      return res.status(404).send({
        message: "Problem not found",
        response: false,
      });
    }

    const { visibleTestCases } = currentProblem;

    if (!visibleTestCases || visibleTestCases.length === 0) {
      return res.status(400).send({
        message: "No visible test cases available for this problem",
        response: false,
      });
    }

    const languageId = getLanguageById(language);
    if (!languageId) {
      return res.status(400).send({
        message: "Unsupported language",
        response: false,
      });
    }

    // Prepare visible test cases for Judge0 (limited for faster execution)
    const submissions = visibleTestCases.map(({ input, output }) => ({
      source_code: code,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    // Create a temporary submission ID for tracking
    const tempSubmissionId = `run-${Date.now()}-${userId}`;

    // Add job to queue with higher priority (run code should be faster)
    console.log("Inside Run Controller, Before Adding to Queue");
    const job = await codeExecutionQueue.add(
      "execute-code",
      {
        submissions: submissions,
        submissionId: tempSubmissionId,
        problemId: problemId,
        userId: userId.toString(),
        isRunCode: true, // This is just a test run, not a real submission
      },
      {
        priority: 1, // Higher priority than submit code (1 = highest)
      }
    );
    console.log("Inside Run Controller, After Adding to   Queue");

    console.log(`📥 Run Code: User ${userId} → Job ${job.id}`);

    // Immediate response - processing happens in background
    res.status(202).send({
      // 202 Accepted = processing
      message: "Code execution started! Processing in background...",
      response: true,
      jobId: job.id,
      status: "queued",
      isRunCode: true,
    });
  } catch (error) {
    console.error("Error in runCode:", error.message);
    res.status(500).send({
      message: "Something went wrong while running the code",
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

// =============================================
// JOB STATUS CHECKER
// =============================================

const checkJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  try {
    // Get job from Bull queue
    const job = await codeExecutionQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        response: false,
      });
    }

    // Check if user owns this job (security)
    if (job.data.userId !== userId.toString()) {
      return res.status(403).json({
        message: "Access denied",
        response: false,
      });
    }

    const jobState = await job.getState();
    const result = job.returnvalue;

    let responseData = {
      jobId,
      state: jobState,
      isRunCode: job.data.isRunCode,
    };

    // Add result data if job is completed
    if (jobState === "completed" && result) {
      if (job.data.isRunCode) {
        // Run Code results
        responseData = {
          ...responseData,
          message: "Code execution completed",
          summary: {
            totalTestCases: result.totalTestCases,
            passedTestCases: result.testCasesPassed,
            failedTestCases: result.totalTestCases - result.testCasesPassed,
            successRate:
              result.totalTestCases > 0
                ? (
                    (result.testCasesPassed / result.totalTestCases) *
                    100
                  ).toFixed(2)
                : 0,
          },
          testResults: result.processedResults,
          status: result.status,
          runTime: result.runTime,
          memoryUsed: result.memoryUsed,
        };
      } else {
        // Submit Code results
        responseData = {
          ...responseData,
          message: "Code submission completed",
          submissionId: result.submissionId,
          status: result.status,
          testCasesPassed: result.testCasesPassed,
          testCasesTotal: result.totalTestCases,
        };
      }
    } else if (jobState === "failed") {
      responseData.message = "Job failed during processing";
      responseData.error = job.failedReason;
    }

    res.status(200).json({
      message: "Job status retrieved",
      response: true,
      ...responseData,
    });
  } catch (error) {
    console.error("Error checking job status:", error);
    res.status(500).json({
      message: "Error checking job status",
      response: false,
      error: error.message,
    });
  }
};

export { submitCode, runCode, checkJobStatus };
