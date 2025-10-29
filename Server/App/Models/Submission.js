import mongoose from "mongoose";
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "c++", "java"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "wrong", "error"],
      default: "pending",
    },
    runtime: {
      type: Number, // milliseconds
      default: 0,
    },
    memory: {
      type: Number, // kB
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    testCasesTotal: {
      // Recommended addition
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ userId: 1, problemId: 1 });
/* The index { userId: 1, problemId: 1 } means:

We are indexing by userId in ascending order (1) and then by problemId in ascending order.

This index is beneficial for queries that:

Filter by userId alone (because the index starts with userId)

Filter by both userId and problemId (compound fields)

Without Index:
MongoDB performs collection scan (checks every document)

O(n) complexity - gets slower as submissions grow

With 100,000 submissions: 100,000 checks

With Index:
MongoDB uses index seek

O(log n) complexity - much faster

With 100,000 submissions: ~17 checks (log2(100,000))


*/

const Submission = mongoose.model("submission", submissionSchema);

export default Submission;
