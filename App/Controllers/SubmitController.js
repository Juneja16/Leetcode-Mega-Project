import Submission from "../Models/Submission.js";
import Problem from "../Models/Problem.js";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../Utils/problemUtility.js";

const submitCode = async (req, resp) => {
  const { code, language } = req.body;
  const problemId = req.params.id;
  const userId = req.user._id;

  const currentProblem = await Problem.findById(problemId).lean();

  const { hiddenTestCases, visibleTestCases } = currentProblem;

  const submittedResult = await Submission.create({
    code,
    language,
    problemId,
    userId,
    status: "pending",
    testCasesTotal: hiddenTestCases.length + visibleTestCases.length,
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

  let runTime = Infinity,
    memoryUsed = 0,
    errorMessage = null,
    testCasesPassed = 0,
    status = "accepted";

  for (const test of testResult) {
    if (test.status_id == 3) {
      testCasesPassed += 1;
      memoryUsed = Math.max(memoryUsed, test.memory);
      runTime = Math.min(parseFloat(test.time), runTime);
    } else if (test.status_id == 4) {
      status = "error";
      errorMessage = test.stderr;
    } else {
      status = "wrongSolution";
      errorMessage = test.stderr;
    }
  }
  submittedResult.testCasesPassed = testCasesPassed;
  submittedResult.status = status;
  submittedResult.errorMessage = errorMessage;
  submittedResult.runtime = runTime;
  submittedResult.memory = memoryUsed;

  await submittedResult.save();
};

export { submitCode };
