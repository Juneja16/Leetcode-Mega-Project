import { getIDbyLanguageName, submitBatch } from "../utils/ProblemUtility";

const createUser = async (req, res) => {
  // we have to get the details of the Problem from req.body
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    starterCode,
    referenceSolution,
    problemCreator,
  } = req.body;

  //Now before saving the problem we need to validate the data
  if (
    !title ||
    !description ||
    !difficulty ||
    !tags ||
    !visibleTestCases ||
    !hiddenTestCases ||
    !starterCode ||
    !referenceSolution ||
    !problemCreator
  ) {
    return res.status(400).json({ message: "All fields are required" });
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
      const LanguageId = getIDbyLanguageName(language);

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
          return res.status(400).send("Error Occured");
        }
      }
      // We can store it in our DB
    }
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (error) {
    return res.status(500).json({ message: "Error occurred while processing" });
  }
};
