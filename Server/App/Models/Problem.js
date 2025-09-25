import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  difficultyLevel: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: [true, "Difficulty level is required"],
  },
  tags: {
    type: [String],
    required: [true, "Tags are required"],
    enum: [
      "Array",
      "String",
      "Dynamic Programming",
      "Greedy",
      "Backtracking",
      "Recursion",
      "NumberTheory",
      "Math",
    ],
  },
  visibleTestCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String, required: true },
    },
  ],
  hiddenTestCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  starterCode: [
    {
      language: { type: String, required: true },
      initialCode: { type: String, required: true },
    },
  ],
  referenceSolution: [
    {
      language: {
        type: String,
        required: true,
      },
      completeCode: {
        type: String,
        required: true,
      },
    },
  ],
  problemCreator: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
  },
});

const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;
