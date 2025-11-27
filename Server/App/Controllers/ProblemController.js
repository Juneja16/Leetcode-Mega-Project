import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../Utils/problemUtility.js";
import Problem from "../Models/Problem.js";
import Submission from "../Models/Submission.js";

const createProblem = async (req, res) => {
  try {
    // we have to get the details of the Problem from req.body
    const { visibleTestCases, referenceSolution } = req.body;

    // Ensure the route is protected and req.user is available (adminMiddleware)
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin authentication required" });
    }

    // Ensure visibleTestCases & referenceSolution are present (validateProblem should ensure this)
    if (!visibleTestCases || !referenceSolution) {
      return res.status(400).json({
        message: "visibleTestCases and referenceSolution are required",
      });
    }

    // Now Checking the Reference Solution with the TestCases Provided wrt all the Languages
    // Using Judge0 API For that

    // I want to the check the Complete Code (Solution of Problem) against all the Visible Testcases
    // for all the Languages with the help of Judge0
    // For this I want to make the Data align in that Format which can be submitted to Judge0
    //source_code
    // LanguageID
    //stdin
    // stdout
    for (const { language, completeCode } of referenceSolution) {
      // getting the Language ID
      const LanguageId = getLanguageById(language);
      // console.log("LanguageId Fetched :", LanguageId);

      // Making the test cases combined with the CompleteCode and language
      // to make it according to the Judge0 API format
      const submissions = visibleTestCases.map(({ input, output }) => ({
        source_code: completeCode,
        language_id: LanguageId,
        stdin: input,
        expected_output: output,
      }));
      // console.log("Check out submissions::::   ", submissions);
      // we get an array of Objects which contain tokens for the Specific TestCase
      const submissionResult = await submitBatch(submissions);
      // console.log("Check out submissionResult::::   ", submissionResult);

      const resultToken = submissionResult.map((result) => result.token);
      // we want to get the actual result obtained for the test case by verifying those token with the help of
      // get request and finally get the final response
      const testResult = await submitToken(resultToken);
      // console.log("Check out testResult::::   ", testResult);

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

    return res.status(201).json({
      message: "Problem saved successfully",
      status: true,
    });
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

  try {
    if (!id) {
      return res
        .status(400)
        .json({ message: "Problem id is required in params" });
    }

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

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Admin authentication required" });
    }
    for (const { language, completeCode } of referenceSolution) {
      // getting the Language ID
      const LanguageId = getLanguageById(language);

      // Making the test cases combined with the CompleteCode and language
      // to make it according to the Judge0 API format
      const submissions = visibleTestCases.map(({ input, output }) => ({
        source_code: completeCode,
        language_id: LanguageId,
        stdin: input,
        expected_output: output,
      }));

      // we get an array of Objects which contain tokens for the Specific TestCase
      const submissionResult = await submitBatch(submissions);
      console.log("hello Paaji!!");

      const resultToken = submissionResult.map((result) => result.token);
      // we want to get the actual result obtained for the test case by verifying those token with the help of
      // get request and finally get the final response
      const testResult = await submitToken(resultToken);
      console.log(testResult);

      // Now checking if any of the test case got Runtime Error or Wrong Answer we
      // send the Proper Response to the admin that Reference Solution is Wrong
      for (const test of testResult) {
        if (test.status_id != 3) {
          return res
            .status(400)
            .send(`Reference solution for language "${language}" failed `);
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
    console.error("Error in Updating Problem:", error); // full stack in server logs

    res.status(500).json({
      message: "Something went wrong while Updating the problem",
      error: {
        name: error.name, // e.g., ValidationError, CastError, MongoError
        message: error.message, // human-readable message
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: error.errors || null, // mongoose validation errors if any
      },
    });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res
        .status(400)
        .json({ message: "Problem id is required in params" });
    }
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
    // const problem = await Problem.findById(id).select(
    //   "title description difficultyLevel tags "
    // );

    if (!id) {
      return res
        .status(400)
        .json({ message: "Problem id is required in params" });
    }
    const problem = await Problem.findById(id)
      .select(" -hiddenTestCases -problemCreator ")
      .lean();

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

const getTotalProblemsSolved = async (req, res) => {
  // const totalProblemSolved = req.user.problemsSolved.length;
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const totalProblemSolved = Array.isArray(req.user.problemsSolved)
      ? req.user.problemsSolved.length
      : 0;
    res.status(200).send({
      message: "Total Problems Solved by the User : ",
      status: true,
      totalProblemSolved,
    });
  } catch {
    console.error("Error while Fetching Total Problems Solved by User");
    res.status(500).send({
      message: "Something went Wrong in Fetching the Count",
      error: {
        name: error.name, // e.g., ValidationError, CastError, MongoError
        message: error.message, // human-readable message
        details: error.errors || null, // mongoose validation errors if any
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

const getProblemsByUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const populated = await req.user.populate({
      path: "problemsSolved",
      select: "title difficultyLevel tags",
    });

    res.status(200).send({
      message: " Problems Solved by the User : ",
      status: true,
      problemSolved: populated.problemsSolved || [],
    });
  } catch (error) {
    console.error("Error while Fetching Problems Solved by User");
    res.status(500).send({
      message: "Something went Wrong in Fetching the Count",
      error: {
        name: error.name, // e.g., ValidationError, CastError, MongoError
        message: error.message, // human-readable message
        details: error.errors || null, // mongoose validation errors if any
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

const getProblemSubmissions = async (req, res) => {
  try {
    const problemId = req.params.id;
    if (!problemId) {
      return res.status(400).json({ message: "problemId is required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;

    const allSubmissions = await Submission.find({ userId, problemId }).lean();

    // Check if array is empty (length === 0)
    if (!allSubmissions || allSubmissions.length === 0) {
      return res.status(200).json({
        message: "No submissions found for this problem",
        submissions: [], // Always return consistent structure
      });
    }

    return res.status(200).json({
      message: "Submissions retrieved successfully",
      count: allSubmissions.length,
      submissions: allSubmissions,
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

export {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblems,
  getTotalProblemsSolved,
  getProblemsByUser,
  getProblemSubmissions,
};
