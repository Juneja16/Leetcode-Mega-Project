import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../Utils/problemUtility.js";
import Problem from "../Models/Problem.js";

const createProblem = async (req, res) => {
  // we have to get the details of the Problem from req.body
  const {
    title,
    description,
    difficultyLevel,
    tags,
    visibleTestCases,
    hiddenTestCases,
    starterCode,
    referenceSolution,
    problemCreator,
  } = req.body;
  const requiredFields = {
    title,
    description,
    difficultyLevel,
    tags,
    visibleTestCases,
    hiddenTestCases,
    starterCode,
    referenceSolution,
    problemCreator,
  };

  //Now before saving the problem we need to validate the data
  if (
    !title ||
    !description ||
    !difficultyLevel ||
    !tags ||
    !visibleTestCases ||
    !hiddenTestCases ||
    !starterCode ||
    !referenceSolution ||
    !problemCreator
  ) {
    const missingFields = Object.entries(requiredFields)
      .filter(
        ([key, value]) => !value || (Array.isArray(value) && value.length === 0)
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missing: missingFields,
      });
    }
  }

  // Now Checking the Reference Solution with the TestCases Provided wrt all the Languages
  // Using Judge0 API For that

  try {
    // I want to the check the Complete Code (Solution of Problem) against all the Visible Testacases
    // for all the Languages with the help of Judge 0
    // For this I want to make the Data align in that Format which can be submitted to Jusge0
    //source_code
    // LanguageID
    //stdin
    // stdout
    for (const { language, completeCode } of referenceSolution) {
      // getting the Language ID
      const LanguageId = getLanguageById(language);
      console.log("LanguageId Fetched :", LanguageId);

      // Making the test cases combined with the CompleteCode and language
      // to make it according to the Judge0 API format
      const submissions = visibleTestCases.map(({ input, output }) => ({
        source_code: completeCode,
        language_id: LanguageId,
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

      // Now checking if any of the test case got Runtime Error or Wrong Answer we
      // send the Proper Response to the admin that Reference Solution is Wrong
      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occurred");
        }
      }
      // We can store it in our DB
    }
    const userProblem = await Problem.create({
      ...req.body,
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (error) {
    console.error("Error in createProblem:", error); // full stack in server logs

    res.status(500).json({
      message: "Something went wrong while creating the problem",
      error: {
        name: error.name, // e.g., ValidationError, CastError, MongoError
        message: error.message, // human-readable message
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: error.errors || null, // mongoose validation errors if any
      },
    });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    starterCode,
    referenceSolution,
  } = req.body;

  try {
    for (const { language, completeCode } of referenceSolution) {
      // getting the Language ID
      const LanguageId = getLanguageById(language);

      // Making the test cases combined with the CompleteCode and language
      // to make it according to the Judge0 API format
      const submissions = visibleTestCases.map(async ({ input, output }) => ({
        source_code: completeCode,
        language_id: LanguageId,
        stdin: input,
        expected_output: output,
      }));

      // we get an array of Objects which contain tokens for the Specific TestCase
      const submissionResult = await submitBatch(submissions);
      console.log(submissionResult);

      const resultToken = submissionResult.map((result) => result.token);
      // we want to get the actual result obtained for the test case by verifying those token with the help of
      // get request and finally get the final response
      const testResult = await submitToken(resultToken);
      console.log(testResult);

      // Now checking if any of the test case got Runtime Error or Wrong Answer we
      // send the Proper Response to the admin that Reference Solution is Wrong
      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occurred");
        }
      }
      // We can store it in our DB
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        starterCode,
        referenceSolution,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res
      .status(200)
      .json({ message: "Problem updated successfully", updatedProblem });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occurred while updating", error });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res
      .status(200)
      .json({ message: "Problem deleted successfully", deletedProblem });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occurred while deleting", error });
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id).select(
      "title description difficultyLevel tags "
    );

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res
      .status(200)
      .json({ message: "Problem retrieved successfully", problem });
  } catch (error) {
    console.error("Error in getProblemByID:", error); // full stack in server logs

    return res.status(500).json({
      message: "Something went wrong while fetching the problem",
      error: {
        name: error.name, // e.g., ValidationError, CastError, MongoError
        message: error.message, // human-readable message
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: error.errors || null, // mongoose validation errors if any
      },
    });
  }
};

const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select(
      "title description difficultyLevel tags"
    );
    res
      .status(200)
      .json({ message: "Problems retrieved successfully", problems });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occurred while retrieving problems", error });
  }
};

export {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblems,
};
