import User from "../Models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validate, loginValidate } from "../Utils/userValidator.js";
import client from "../Config/redis.js";
dotenv.config({ quiet: true });

const Register = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, lastName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "user",
    });

    const userResponse = await newUser.save();

    // token expired time in seconds
    const token = jwt.sign(
      { id: userResponse._id, email: email, role: userResponse.role },
      process.env.JWT_SECRET,
      {
        expiresIn: 365 * 24 * 60 * 60,
      }
    );

    // cookie max age in milliseconds
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully!",
      status: true,
      userResponse,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const Login = async (req, res) => {
  try {
    loginValidate(req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    console.log(password, user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, email: email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: 365 * 24 * 60 * 60,
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: `${user.role} logged in successfully!`,
      status: true,
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// why only clearing the token from cookie will not work in production ready apps
//Token will still be valid until it expires
// iF someone gets my token before expiry jwt will verify and give the access to my app previous data
// thats not acceptable in big Firms
// Hence we take the help of Second Layer (Redis Server Side cache) to check that token has
// been removed or not
// if its in redis Blacklist then we know user is logged out
const Logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.decode(token);

    await client.set(`token:${token}`, "Blocked");
    await client.expireAt(`token:${token}`, payload.exp);

    // Add token to Redis blacklist
    // await client.set(`token:${token}`, "blacklisted", "EX", 365 * 24 * 60 * 60);

    res.clearCookie("token");
    res.status(200).json({
      message: "User logged out successfully!",
      status: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const Check = async (req, res) => {
  res
    .status(201)
    .json({ message: "Token Verified Successfully", status: true.req.user });
};

// admin Register
// Admin cant be registered normally like that of a user
// Admins need to be created by a super admin
// and that Super Admin has been registered directly from database or before creating the Routes
// That Super admin confirmation in admin Middleware
// and then that admin will be created on AdminRegister Route
const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, lastName, email, password } = req.body;

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
        expiresIn: 365 * 24 * 60 * 60,
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Admin registered successfully!",
      status: true,
      adminResponse,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export { Register, Login, Logout, Check, adminRegister };
