import express from "express";
import dotenv from "dotenv";
import connectDB from "./App/Config/db.js";
import cookieParser from "cookie-parser";
import client from "./App/Config/redis.js";
import AuthRouter from "./App/routes/UserRoutes.js";
import ProblemRouter from "./App/routes/ProblemRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    await Promise.all([connectDB(), redisClient.connect()]);
    console.log("DB Connected");

    app.listen(process.env.PORT, () => {
      console.log("Server listening at port number: " + process.env.PORT);
    });
  } catch (err) {
    console.log("Error: " + err);
  }
};
initalizeConnection();
