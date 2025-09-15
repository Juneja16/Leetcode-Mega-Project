import express from "express";
import dotenv from "dotenv";
import connectDB from "./App/Config/db.js";
import client from "./App/Config/redis.js";
import cookieParser from "cookie-parser";
import AuthRouter from "./App/routes/UserRoutes.js";
import ProblemRouter from "./App/routes/ProblemRoutes.js";
dotenv.config({ quiet: true });

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/user", AuthRouter);
app.use("/problem", ProblemRouter);

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
      console.log("Server listening at port number: " + process.env.PORT);
    });
  } catch (err) {
    console.log("Error: " + err);
  }
};
initalizeConnection();
