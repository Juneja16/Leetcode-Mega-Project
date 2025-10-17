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
    enum: {
      values: ["easy", "medium", "hard"],
      message: "Difficulty level must be either easy, medium, or hard",
    },
    required: [true, "Difficulty level is required"],
    set: (value) => value.toLowerCase(), // Normalize to lowercase
  },
  tags: {
    type: [String],
    enum: {
      values: [
        "array",
        "string",
        "hash table",
        "dynamic programming",
        "math",
        "sorting",
        "greedy",
        "depth-first search",
        "binary search",
        "database",
        "matrix",
        "bit manipulation",
        "tree",
        "breadth-first search",
        "two pointers",
        "prefix sum",
        "heap (priority queue)",
        "simulation",
        "counting",
        "graph",
        "binary tree",
        "stack",
        "sliding window",
        "design",
        "enumeration",
        "backtracking",
        "union find",
        "number theory",
        "linked list",
        "ordered set",
        "monotonic stack",
        "segment tree",
        "trie",
        "combinatorics",
        "bitmask",
        "divide and conquer",
        "queue",
        "recursion",
        "geometry",
        "binary indexed tree",
        "memoization",
        "hash function",
        "binary search tree",
        "shortest path",
        "string matching",
        "topological sort",
        "rolling hash",
        "game theory",
        "interactive",
        "data stream",
        "monotonic queue",
        "brainteaser",
        "doubly-linked list",
        "randomized",
        "merge sort",
        "counting sort",
        "iterator",
        "concurrency",
        "line sweep",
        "probability and statistics",
        "quickselect",
        "suffix array",
        "minimum spanning tree",
        "bucket sort",
        "shell",
        "reservoir sampling",
        "strongly connected component",
        "eulerian circuit",
        "radix sort",
        "rejection sampling",
        "biconnected component",
      ],
      message: "Invalid tag provided",
    },
    required: [true, "At least one tag is required"],
    set: (tags) => tags.map((tag) => tag.toLowerCase()), // Normalize to lowercase
    // Now it has become Case Insensitive that means
    // if ARRAY,Array,array===array
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
