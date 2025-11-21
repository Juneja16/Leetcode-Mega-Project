import Submission from "../Models/Submission.js";
import Problem from "../Models/Problem.js";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../Utils/problemUtility.js";

const submitCode = async (req, res) => {
  const { code, language } = req.body;
  const problemId = req.params.id;
  const userId = req.user._id;

  try {
    const currentProblem = await Problem.findById(problemId).lean();

    const { hiddenTestCases, visibleTestCases } = currentProblem;

    const submittedResult = await Submission.create({
      code,
      language,
      problemId,
      userId,
      status: "pending",
      testCasesTotal: hiddenTestCases.length,
    });

    const languageId = getLanguageById(language);
    const submissions = hiddenTestCases.map(({ input, output }) => ({
      source_code: code,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    console.log("Check out submissions::::   ", submissions);
    // we get an array of Objects which contain tokens for the Specific TestCase
    const submissionResult = await submitBatch(submissions);
    console.log("Check out submissionResult::::   ", submissionResult);

    const resultToken = submissionResult.map((result) => result.token);
    // we want to get the actual result obtained for the test case by verifying those token with the help of
    // get request and finally get the final response
    const testResult = await submitToken(resultToken);
    console.log("Check out testResult::::   ", testResult);

    //Now as i received the status of the code with the test cases
    // we will update the Database with the Full Information of the Submission

    let runTime = 0,
      memoryUsed = 0,
      testCasesPassed = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        // Accepted
        testCasesPassed += 1;
        memoryUsed = Math.max(memoryUsed, test.memory || 0);
        runTime = Math.max(runTime, parseFloat(test.time) || 0);
      } else if (test.status_id === 4) {
        // Wrong Answer
        status = "wrong";
        if (!errorMessage) errorMessage = "Wrong Answer";
        // Don't break here - continue to count other test cases
      } else {
        // Actual Errors (compilation, runtime, etc.)
        status = "error";
        errorMessage = test.stderr || `Status: ${test.status_id}`;
        // Don't break here either - continue to count other test cases
      }
    }
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.status = status;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runTime;
    submittedResult.memory = memoryUsed;

    const finalSubmittedResponse = await submittedResult.save();

    // Now if Submission is Accepted we will add the Problem Id to the User
    // as this Problem is now being solved by the User

    if (finalSubmittedResponse.status === "accepted") {
      if (!req.user.problemsSolved.includes(problemId)) {
        req.user.problemsSolved.push(problemId);
        await req.user.save();
      }
    }

    res.status(201).send({
      message: "Code Submitted Properly",
      response: true,
      finalSubmittedResponse,
    });
  } catch (error) {
    console.error("Error in Submitted Code : ", error.message);
    res.status(500).send({
      message: "Something went Wrong in submitting the Code",
      error: {
        name: error.name, // e.g., ValidationError, CastError, MongoError
        message: error.message, // human-readable message
        details: error.errors || null, // mongoose validation errors if any
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};
const runCode = async (req, res) => {
  const { code, language } = req.body;
  const problemId = req.params.id;

  try {
    const currentProblem = await Problem.findById(problemId).lean();
    if (!currentProblem) {
      return res.status(404).send({
        message: "Problem not found",
        response: false
      });
    }

    const { visibleTestCases } = currentProblem;
    
    // Check if there are visible test cases
    if (!visibleTestCases || visibleTestCases.length === 0) {
      return res.status(400).send({
        message: "No visible test cases available for this problem",
        response: false
      });
    }

    const languageId = getLanguageById(language);
    if (!languageId) {
      return res.status(400).send({
        message: "Unsupported language",
        response: false
      });
    }

    const submissions = visibleTestCases.map(({ input, output }) => ({
      source_code: code,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    console.log("Submissions to Judge0:", submissions);
    
    const submissionResult = await submitBatch(submissions);
    console.log("Judge0 submission tokens:", submissionResult);

    const resultToken = submissionResult.map((result) => result.token);
    const testResult = await submitToken(resultToken);
    console.log("Judge0 test results:", testResult);

    // Process results with safety checks
    const processedResults = testResult.map((result, index) => {
      const testCase = visibleTestCases[index];
      
      // Safety check in case arrays don't align
      if (!testCase) {
        return {
          testCase: index + 1,
          input: "N/A",
          expectedOutput: "N/A", 
          actualOutput: result.stdout || '',
          status: getStatusDescription(result.status_id),
          statusId: result.status_id,
          runtime: result.time ? parseFloat(result.time) : 0,
          memory: result.memory || 0,
          error: result.stderr || 'Test case data missing',
          compileOutput: result.compile_output,
          passed: false
        };
      }
      
      return {
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.stdout || '',
        status: getStatusDescription(result.status_id),
        statusId: result.status_id,
        runtime: result.time ? parseFloat(result.time) : 0,
        memory: result.memory || 0,
        error: result.stderr,
        compileOutput: result.compile_output,
        passed: result.status_id === 3
      };
    });

    // Calculate summary
    const passedCount = processedResults.filter(r => r.passed).length;
    const totalCount = visibleTestCases.length;

    const summary = {
      totalTestCases: totalCount,
      passedTestCases: passedCount,
      failedTestCases: totalCount - passedCount,
      successRate: totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(2) : 0
    };

    res.status(200).send({
      message: "Code executed successfully",
      response: true,
      summary,
      testResults: processedResults,
    });

  } catch (error) {
    console.error("Error in running code:", error.message);
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

// Add this helper function (make sure it's in scope)
const getStatusDescription = (statusId) => {
  const statusMap = {
    1: 'In Queue',
    2: 'Processing', 
    3: 'Accepted',
    4: 'Wrong Answer',
    5: 'Time Limit Exceeded',
    6: 'Compilation Error',
    7: 'Runtime Error',
    8: 'Runtime Error', 
    9: 'Runtime Error',
    10: 'Runtime Error',
    11: 'Runtime Error',
    12: 'Runtime Error',
    13: 'Internal Error',
    14: 'Exec Format Error'
  };
  return statusMap[statusId] || `Unknown Status (${statusId})`;
};

export { submitCode, runCode };
