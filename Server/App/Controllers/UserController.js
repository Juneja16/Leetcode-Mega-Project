// App/Controllers/UserController.js
import User from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import client from "../Config/redis.js";
import {
  userRegisterSchema,
  userLoginSchema,
  adminRegisterSchema,
} from "../Utils/userValidation.js";

dotenv.config({ quiet: true });

const Register = async (req, res) => {
  try {
    // Validate input using Joi and use sanitized value
    const { error, value } = userRegisterSchema.validate(req.body, {
      abortEarly: false, // show all errors not the first one
      stripUnknown: true, // prevents unknown fields to save in the database i.e ignoring them
    });

    if (error) {
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }

    // Extracting this from JOI Validated Value not req.body
    // and Normalize email to lowercase before DB operations to avoid duplicate accounts
    //  that differ only by case.
    const { firstName, lastName, email, password } = {
      ...value,
      email: value.email.toLowerCase(),
    };

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
    });

    const userResponse = await newUser.save();

    // token expiry in seconds
    const token = jwt.sign(
      { id: userResponse._id, email: email, role: userResponse.role },
      process.env.JWT_SECRET,
      {
        expiresIn: 24 * 60 * 60, // 1 day
      }
    );

    // cookie max age in milliseconds
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully!",
      status: true,
      userResponse,
    });
  } catch (error) {
    // Distinguish duplicate key error if somehow missed above
    if (error && error.code === 11000) {
      return res
        .status(409)
        .json({ message: "User with this email already exists", error });
    }

    console.error("Register error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const Login = async (req, res) => {
  try {
    // Validate input using Joi
    const { error, value } = userLoginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }

    const { email: rawEmail, password } = value;
    const email = rawEmail.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      // preserve previous behavior but return 401 for unauthorized
      return res.status(401).json({ message: "User not Registered!!!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password!!!" });
    }

    const token = jwt.sign(
      { id: user._id, email: email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: 24 * 60 * 60,
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: `${user.role} logged in successfully!`,
      status: true,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const Logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized Token!!" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;
    const userFound = await User.findById(userId).select("-password").lean();

    // Store token in redis blacklist and set TTL to token expiry
    await client.set(`token:${token}`, "Blocked");

    // payload.exp is in seconds since epoch — expireAt expects unix timestamp (seconds)
    if (payload && payload.exp) {
      await client.expireAt(`token:${token}`, payload.exp);
    }

    res.clearCookie("token");
    res.status(200).json({
      message: `${userFound.role} logged out successfully!`,
      status: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const Check = async (req, res) => {
  try {
    // If the token was valid, auth middleware already set req.user
    res.status(200).json({
      message: "Token Verified Successfully",
      status: true,
      user: req.user,
    });
  } catch (error) {
    console.error("CHECK ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin Register (created by super-admin via adminMiddleware)
const adminRegister = async (req, res) => {
  try {
    const { error, value } = adminRegisterSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }

    // Extracting this from JOI Validated Value not req.body
    // and Normalize email to lowercase before DB operations to avoid duplicate accounts
    //  that differ only by case.
    const { firstName, lastName, email: rawEmail, password } = value;
    const email = rawEmail.toLowerCase();

    // Check if admin/email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    const adminResponse = await newAdmin.save();

    const token = jwt.sign(
      { id: adminResponse._id, email: email, role: adminResponse.role },
      process.env.JWT_SECRET,
      {
        expiresIn: 24 * 60 * 60, // 1 year
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Admin registered successfully!",
      status: true,
      adminResponse,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res
        .status(409)
        .json({ message: "User with this email already exists", error });
    }
    console.error("Admin register error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export { Register, Login, Logout, Check, adminRegister };
