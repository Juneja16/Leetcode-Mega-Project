import Joi from "joi";

// Common patterns
const languageSchema = Joi.object({
  language: Joi.string().required().messages({
    "any.required": "Language is required",
    "string.empty": "Language cannot be empty",
  }),
  initialCode: Joi.string().required().messages({
    "any.required": "Initial code is required",
    "string.empty": "Initial code cannot be empty",
  }),
});

const referenceSolutionSchema = Joi.object({
  language: Joi.string().required().messages({
    "any.required": "Language is required",
    "string.empty": "Language cannot be empty",
  }),
  completeCode: Joi.string().required().messages({
    "any.required": "Complete code is required",
    "string.empty": "Complete code cannot be empty",
  }),
});

const testCaseSchema = Joi.object({
  input: Joi.string().required().messages({
    "any.required": "Test case input is required",
    "string.empty": "Test case input cannot be empty",
  }),
  output: Joi.string().required().messages({
    "any.required": "Test case output is required",
    "string.empty": "Test case output cannot be empty",
  }),
});

const visibleTestCaseSchema = testCaseSchema.keys({
  explanation: Joi.string().required().messages({
    "any.required": "Explanation is required",
    "string.empty": "Explanation cannot be empty",
  }),
});

const problemCreatorSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "any.required": "Creator ID is required",
    "string.hex": "Creator ID must be a valid hexadecimal",
    "string.length": "Creator ID must be 24 characters long",
  }),
  name: Joi.string().required().messages({
    "any.required": "Creator name is required",
    "string.empty": "Creator name cannot be empty",
  }),
});

// Main Problem Validation Schema
const problemValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),

  description: Joi.string().required().messages({
    "any.required": "Description is required",
    "string.empty": "Description cannot be empty",
  }),

  difficultyLevel: Joi.string()
    .valid("easy", "medium", "hard")
    .required()
    .messages({
      "any.required": "Difficulty level is required",
      "any.only": "Difficulty level must be either easy, medium, or hard",
    }),

  tags: Joi.array()
    .items(
      Joi.string()
        .valid(
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
          "biconnected component"
        )
        .messages({
          "any.only": "Invalid tag provided: {{#label}}",
        })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "At least one tag is required",
      "array.min": "At least one tag is required",
      "array.includes": "Invalid tag provided",
    }),

  visibleTestCases: Joi.array()
    .items(visibleTestCaseSchema)
    .min(1)
    .required()
    .messages({
      "any.required": "Visible test cases are required",
      "array.min": "At least one visible test case is required",
      "array.base": "Visible test cases must be an array of objects",
    }),

  hiddenTestCases: Joi.array()
    .items(testCaseSchema)
    .min(1)
    .required()
    .messages({
      "any.required": "Hidden test cases are required",
      "array.min": "At least one hidden test case is required",
      "array.base": "Hidden test cases must be an array of objects",
    }),

  starterCode: Joi.array().items(languageSchema).min(1).required().messages({
    "any.required": "Starter code is required",
    "array.min": "Starter code for at least one language is required",
    "array.base": "Starter code must be an array of objects",
  }),

  referenceSolution: Joi.array()
    .items(referenceSolutionSchema)
    .min(1)
    .required()
    .messages({
      "any.required": "Reference solution is required",
      "array.min": "Reference solution for at least one language is required",
      "array.base": "Reference solution must be an array of objects",
    }),

  problemCreator: problemCreatorSchema.required().messages({
    "any.required": "Problem creator information is required",
  }),
});

// Validation middleware
const validateProblem = (req, res, next) => {
  const { error, value } = problemValidationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorDetails = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(400).json({
      message: "Validation failed",
      errors: errorDetails,
    });
  }

  // Normalize case for difficultyLevel and tags
  if (value.difficultyLevel) {
    value.difficultyLevel = value.difficultyLevel.toLowerCase();
  }
  if (value.tags) {
    value.tags = value.tags.map((tag) => tag.toLowerCase());
  }

  req.body = value;
  next();
};

export default validateProblem;
