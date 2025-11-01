import express from "express";
import dotenv from "dotenv";
import connectDB from "./App/Config/db.js";
import client from "./App/Config/redis.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./App/Routes/UserRoutes.js";
import ProblemRouter from "./App/Routes/ProblemRoutes.js";
import SubmitRouter from "./App/Routes/SubmissionRoutes2.js";
import configureCors from "./App/Config/cors.config.js";
import { generalLimiter } from "./Middleware/rateLimiter.js";

dotenv.config({ quiet: true });

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(configureCors());
app.use(generalLimiter);

app.use("/user", AuthRouter);
app.use("/problem", ProblemRouter);
app.use("/submit", SubmitRouter);

app.get("/", (req, res) => {
  res.send("Hello World! Day 2");
});

const redisClient = client;
const initalizeConnection = async () => {
  try {
    //Parallel connection = faster startup (instead of connecting sequentially).
    // Runs MongoDB connection (connectDB()) and Redis connection (redisClient.connect()) in parallel.

    // If both succeed ✅ → execution continues.
    await Promise.all([connectDB(), redisClient.connect()]);
    console.log("Mongo DB Connected");
    console.log("Redis connected");

    app.listen(process.env.PORT, () => {
      console.log("🚀 Server listening at port: " + process.env.PORT);
      console.log("📊 Rate Limits:");
      console.log("   - General: 100 requests/15min");
      console.log("   - Auth: 5 attempts/15min");
      console.log("   - Code Execution: 10/minute");
      console.log("   - Submissions: 15/minute");
    });
  } catch (err) {
    console.log("Error: " + err);
  }
};
initalizeConnection();
