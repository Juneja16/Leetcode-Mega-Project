import Queue from "bull";
import { submitBatch, submitToken } from "../Utils/problemUtility.js";
import Submission from "../Models/Submission.js";
import User from "../Models/User.js";

console.log("Running Fine");

// =============================================
// QUEUE CONFIGURATION
// =============================================

// Create main queue for code execution
const codeExecutionQueue = new Queue("code execution", {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME || "default",
  },
  // Rate limiting to prevent Judge0 API abuse
  limiter: {
    max: 20, // Max 20 jobs per second
    duration: 1000,
  },
  // Default job options
  defaultJobOptions: {
    attempts: 2, // Retry failed jobs twice
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 10, // Keep last 10 failed jobs
    timeout: 30000, // 30 second timeout per job
  },
});

// =============================================
// JOB PROCESSOR - 5 CONCURRENT WORKERS
// =============================================

// Process 5 jobs concurrently - this is the magic number for parallel processing
codeExecutionQueue.process("execute-code", 5, async (job) => {
  console.log(
    `🚀 Worker started job ${job.id} for ${
      job.data.isRunCode ? "Run Code" : "Submit Code"
    }`
  );

  const { submissions, submissionId, problemId, userId, isRunCode } = job.data;

  try {
    // For Submit Code: Update database status to "processing"
    if (!isRunCode) {
      await Submission.findByIdAndUpdate(submissionId, {
        status: "processing",
      });
    }

    // Step 1: Submit code to Judge0 API
    const submissionResult = await submitBatch(submissions);
    const resultToken = submissionResult.map((result) => result.token);

    // Step 2: Wait for Judge0 results (this is the slow part)
    const testResult = await submitToken(resultToken);

    console.log(
      `✅ Job ${job.id} completed in ${Date.now() - job.timestamp}ms`
    );

    // Step 3: Process Judge0 results
    let runTime = 0,
      memoryUsed = 0,
      testCasesPassed = 0;
    let status = "accepted";
    let errorMessage = null;
    let processedResults = [];

    for (const test of testResult) {
      if (test.status_id === 3) {
        // Test case passed
        testCasesPassed += 1;
        memoryUsed = Math.max(memoryUsed, test.memory || 0);
        runTime = Math.max(runTime, parseFloat(test.time) || 0);
      } else if (test.status_id === 4) {
        // Wrong Answer
        status = "wrong";
        if (!errorMessage) errorMessage = "Wrong Answer";
      } else {
        // Runtime/Compilation Error
        status = "error";
        errorMessage = test.stderr || `Judge0 Status: ${test.status_id}`;
        break;
      }
    }

    // Step 4: Handle results based on job type
    if (isRunCode) {
      // For Run Code: Format results for immediate frontend display
      processedResults = testResult.map((result, index) => {
        const testCase = submissions[index]
          ? {
              input: submissions[index].stdin,
              output: submissions[index].expected_output,
            }
          : null;

        return {
          testCase: index + 1,
          input: testCase ? testCase.input : "N/A",
          expectedOutput: testCase ? testCase.output : "N/A",
          actualOutput: result.stdout || "",
          status: getStatusDescription(result.status_id),
          statusId: result.status_id,
          runtime: result.time ? parseFloat(result.time) : 0,
          memory: result.memory || 0,
          error: result.stderr,
          compileOutput: result.compile_output,
          passed: result.status_id === 3,
        };
      });

      return {
        success: true,
        jobType: "run-code",
        status,
        testCasesPassed,
        totalTestCases: submissions.length,
        runTime,
        memoryUsed,
        processedResults,
        processingTime: Date.now() - job.timestamp,
      };
    } else {
      // For Submit Code: Update database and user progress
      const updatedSubmission = await Submission.findByIdAndUpdate(
        submissionId,
        {
          testCasesPassed,
          status,
          errorMessage,
          runtime: runTime,
          memory: memoryUsed,
        },
        { new: true }
      );

      // Update user's solved problems if accepted
      if (status === "accepted") {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { problemsSolved: problemId },
        });
      }

      return {
        success: true,
        jobType: "submit-code",
        submissionId,
        status,
        testCasesPassed,
        totalTestCases: submissions.length,
        processingTime: Date.now() - job.timestamp,
      };
    }
  } catch (error) {
    console.error(`❌ Job ${job.id} failed:`, error.message);

    // Handle errors based on job type
    if (!isRunCode) {
      await Submission.findByIdAndUpdate(submissionId, {
        status: "error",
        errorMessage: `System error: ${error.message}`,
      });
    }

    throw error; // Trigger Bull's retry mechanism
  }
});

// =============================================
// QUEUE EVENT LISTENERS - MONITORING
// =============================================

codeExecutionQueue.on("waiting", (jobId) => {
  console.log(`📥 Job ${jobId} waiting in queue`);
});

codeExecutionQueue.on("active", (job) => {
  console.log(
    `🔧 Job ${job.id} started processing - Type: ${
      job.data.isRunCode ? "Run Code" : "Submit Code"
    }`
  );
});

codeExecutionQueue.on("completed", (job, result) => {
  console.log(
    `✅ Job ${job.id} completed in ${result.processingTime}ms - ${result.jobType}`
  );
});

codeExecutionQueue.on("failed", (job, error) => {
  console.log(`❌ Job ${job.id} failed:`, error.message);
});

codeExecutionQueue.on("stalled", (job) => {
  console.log(`⚠️ Job ${job.id} stalled`);
});

// =============================================
// HELPER FUNCTIONS
// =============================================

// Helper function for status descriptions
const getStatusDescription = (statusId) => {
  const statusMap = {
    1: "In Queue",
    2: "Processing",
    3: "Accepted",
    4: "Wrong Answer",
    5: "Time Limit Exceeded",
    6: "Compilation Error",
    7: "Runtime Error",
    13: "Internal Error",
    14: "Exec Format Error",
  };
  return statusMap[statusId] || `Unknown Status (${statusId})`;
};

// Get queue status for monitoring
export const getQueueStatus = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    codeExecutionQueue.getWaiting(),
    codeExecutionQueue.getActive(),
    codeExecutionQueue.getCompleted(),
    codeExecutionQueue.getFailed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    total: waiting.length + active.length + completed.length + failed.length,
  };
};

export default codeExecutionQueue;
