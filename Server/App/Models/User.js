import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      // required:[true,message];
      // This will generate the error message as we provided so that it will  be easily
      // debuggable if error comes from this end
      // Specifying correctly that error came from this end
      required: [true, "Email is required"],
      unique: true,
    },
    age: {
      type: Number,
      min: [13, "Age must be at least 13 years"],
      max: [120, "Age cannot exceed 120 years"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [100, "Password cannot exceed 100 characters"],
    },
    problemsSolved: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Problem",
        },
      ],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
